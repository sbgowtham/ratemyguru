import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;

// ============================================
// SUPABASE CLIENT
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service key for backend (bypasses RLS for admin ops)
);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({ 
  origin: [
    "http://localhost:3000",
    "https://ratemyguru.in",
    "https://www.ratemyguru.in",
    "https://ratemyguru-frontend.vercel.app",
    "https://ratemyguru.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Rate limiting — prevents spam
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: "Too many requests" } });
const strictLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: "Slow down!" } });
app.use(limiter);

// ============================================
// AUTH MIDDLEWARE
// ============================================
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Login required" });

  // Look up user directly by their ID stored as token
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", token)
    .single();

  if (error || !profile) return res.status(401).json({ error: "Invalid session" });
  if (profile.is_banned) return res.status(403).json({ error: "Account suspended" });

  req.user = profile;
  next();
}

function requireAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// ============================================
// HELPER: LinkedIn quality check
// ============================================
function checkLinkedInQuality(user) {
  const issues = [];
  // Check account age in our system - if created less than 1 hour ago, flag it
  const accountAge = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60);
  if (accountAge < 0.1) issues.push("Account too new. Please try again in a few minutes.");
  return issues;
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", service: "LearnRate API" }));

// ============================================
// CREATORS
// ============================================

// GET /api/creators — list with filters + search
app.get("/api/creators", async (req, res) => {
  try {
    const { category, country, state, search, sort = "rating", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("creators")
      .select("id, name, platform, youtube_id, instagram_id, website, slug, category, country, state, bio, avatar_letter, avatar_color, subscribers, tags, avg_rating, review_count, verified", { count: "exact" })
      .eq("status", "approved")
      .range(offset, offset + limit - 1);

    if (category && category !== "All") query = query.eq("category", category);
    if (country && country !== "All Countries") query = query.eq("country", country);
    if (state && state !== "All States") query = query.eq("state", state);
    if (search) query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%,tags.cs.{${search}}`);

    if (sort === "rating") query = query.order("avg_rating", { ascending: false });
    else if (sort === "reviews") query = query.order("review_count", { ascending: false });
    else if (sort === "newest") query = query.order("approved_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ creators: data, total: count, page: Number(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/creators/:id — single creator detail
app.get("/api/creators/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .eq("id", req.params.id)
      .eq("status", "approved")
      .single();

    if (error || !data) return res.status(404).json({ error: "Creator not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/creators/:id/edit — submit edit request
app.post("/api/creators/:id/edit", requireAuth, async (req, res) => {
  try {
    const { name, youtube_id, instagram_id, website, bio, subscribers, tags } = req.body;
    const proposed_changes = {};
    if (name) proposed_changes.name = name;
    if (youtube_id) proposed_changes.youtube_id = youtube_id;
    if (instagram_id) proposed_changes.instagram_id = instagram_id;
    if (website) proposed_changes.website = website;
    if (bio) proposed_changes.bio = bio;
    if (subscribers) proposed_changes.subscribers = subscribers;
    if (tags) proposed_changes.tags = tags;

    if (Object.keys(proposed_changes).length === 0) {
      return res.status(400).json({ error: "No changes provided" });
    }

    const { data, error } = await supabase
      .from("creator_edits")
      .insert({
        creator_id: req.params.id,
        submitted_by: req.user.id,
        proposed_changes,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Edit submitted for review", edit_id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/edits/pending
app.get("/api/admin/edits/pending", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("creator_edits")
      .select("*, creators(name, youtube_id, instagram_id), users(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/edits/:id/approve
app.put("/api/admin/edits/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { data: edit, error: editError } = await supabase
      .from("creator_edits")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (editError) throw editError;

    // Apply changes to creator
    const { error } = await supabase
      .from("creators")
      .update(edit.proposed_changes)
      .eq("id", edit.creator_id);
    if (error) throw error;

    // Mark edit as approved
    await supabase.from("creator_edits").update({ status: "approved" }).eq("id", req.params.id);
    res.json({ message: "Edit approved and applied" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/edits/:id/reject
app.put("/api/admin/edits/:id/reject", requireAdmin, async (req, res) => {
  try {
    await supabase.from("creator_edits").update({ status: "rejected" }).eq("id", req.params.id);
    res.json({ message: "Edit rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/creators — submit new creator (requires auth)
app.post("/api/creators", requireAuth, strictLimiter, async (req, res) => {
  try {
    const { name, platform, category, country, state, bio, subscribers, tags } = req.body;
const youtube_id = req.body.youtube_id || null;
const instagram_id = req.body.instagram_id || null;

    // Validation
    if (!name || !platform || !category || !country || !bio) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!youtube_id && !instagram_id) {
      return res.status(400).json({ error: "Provide at least YouTube or Instagram ID" });
    }
    if (bio.length < 20) {
      return res.status(400).json({ error: "Bio must be at least 20 characters" });
    }

    // DUPLICATE CHECK — core feature
    let duplicateOf = null;
    if (youtube_id) {
      const { data: existing } = await supabase
  .from("creators")
  .select("id, name, status")
  .ilike("youtube_id", youtube_id)
  .single();

      if (existing) {
        // Log the duplicate attempt
        await supabase.from("creator_submissions").insert({
          submitted_by: req.user.id,
          youtube_id,
          instagram_id,
          was_duplicate: true,
          duplicate_of: existing.id,
        });
        return res.status(409).json({
          error: "Creator already exists",
          duplicate: { id: existing.id, name: existing.name, status: existing.status }
        });
      }
    }

    if (instagram_id) {
      const { data: existing } = await supabase
  .from("creators")
  .select("id, name, status")
  .ilike("instagram_id", instagram_id)
  .single();

      if (existing) {
        await supabase.from("creator_submissions").insert({
          submitted_by: req.user.id,
          youtube_id,
          instagram_id,
          was_duplicate: true,
          duplicate_of: existing.id,
        });
        return res.status(409).json({
          error: "Creator already exists",
          duplicate: { id: existing.id, name: existing.name, status: existing.status }
        });
      }
    }

    // Insert creator (pending approval)
    const { data: creator, error } = await supabase
      .from("creators")
      .insert({
        name, platform, youtube_id, instagram_id,
        category, country, state, bio,
        subscribers, tags: tags || [],
        avatar_letter: name[0].toUpperCase(),
        submitted_by: req.user.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Log submission
    await supabase.from("creator_submissions").insert({
      creator_id: creator.id,
      submitted_by: req.user.id,
      youtube_id,
      instagram_id,
      was_duplicate: false,
    });

    res.status(201).json({ message: "Creator submitted for review", creator_id: creator.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// REVIEWS
// ============================================

// GET /api/creators/:id/reviews
app.get("/api/creators/:id/reviews", async (req, res) => {
  try {
    const { sort = "recent", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("reviews")
      .select(`
        id, rating, text, upvotes, downvotes, is_verified_learner, created_at,
        users (name, headline, profile_picture, connections_count)
      `, { count: "exact" })
      .eq("creator_id", req.params.id)
      .eq("status", "approved")
      .range(offset, offset + limit - 1);

    if (sort === "recent") query = query.order("created_at", { ascending: false });
    else if (sort === "helpful") query = query.order("upvotes", { ascending: false });
    else if (sort === "highest") query = query.order("rating", { ascending: false });
    else if (sort === "lowest") query = query.order("rating", { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ reviews: data, total: count, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/creators/:id/reviews — submit review (requires auth)
app.post("/api/creators/:id/reviews", requireAuth, strictLimiter, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const creator_id = req.params.id;

    // Validation
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
    if (!text || text.length < 30) return res.status(400).json({ error: "Review must be at least 50 characters" });

    // LinkedIn quality check
    const qualityIssues = checkLinkedInQuality(req.user);
    if (qualityIssues.length > 0) return res.status(403).json({ error: qualityIssues[0] });

    // Check creator exists and is approved
    const { data: creator } = await supabase
      .from("creators")
      .select("id, name")
      .eq("id", creator_id)
      .eq("status", "approved")
      .single();

    if (!creator) return res.status(404).json({ error: "Creator not found" });

    // Velocity check — same user reviewing too fast
   const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { count: recentReviews } = await supabase
  .from("reviews")
  .select("id", { count: "exact", head: true })
  .eq("user_id", req.user.id)
  .gte("created_at", oneHourAgo);

if ((recentReviews || 0) >= 3) {
  return res.status(429).json({ error: "You're reviewing too fast. Please wait before submitting more reviews." });
}


    // New account check (account < 24hrs old = hold for manual review)
    const accountAge = (Date.now() - new Date(req.user.created_at)) / (1000 * 60 * 60);
    //const autoStatus = accountAge < 24 ? "pending" : "pending"; // all go to pending for now, admin approves
const autoStatus = "approved";

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        creator_id,
        user_id: req.user.id,
        rating,
        text: text.trim(),
        status: autoStatus,
        is_verified_learner: (req.user.connections_count || 0) > 200,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Review submitted for approval. Goes live within 24hrs.", review_id: review.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/vote — upvote or downvote a review
app.post("/api/reviews/:id/vote", requireAuth, async (req, res) => {
  try {
    const { vote_type } = req.body;
    if (!["up", "down"].includes(vote_type)) return res.status(400).json({ error: "vote_type must be 'up' or 'down'" });

    // Upsert vote
    const { error } = await supabase
      .from("review_votes")
      .upsert({ review_id: req.params.id, user_id: req.user.id, vote_type }, { onConflict: "review_id,user_id" });

    if (error) throw error;
    res.json({ message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/flag — flag a review
app.post("/api/reviews/:id/flag", requireAuth, async (req, res) => {
  try {
    const { reason, details } = req.body;
    const validReasons = ["fake", "spam", "offensive", "irrelevant", "other"];
    if (!validReasons.includes(reason)) return res.status(400).json({ error: "Invalid reason" });

    const { error } = await supabase
      .from("review_flags")
      .insert({ review_id: req.params.id, user_id: req.user.id, reason, details });

    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "You already flagged this review" });
      throw error;
    }

    res.json({ message: "Review flagged. Our team will look into it." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/admin/creators/pending
app.get("/api/admin/creators/pending", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("creators")
      .select("*, users!submitted_by(name, email)")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/creators/:id/approve
app.put("/api/admin/creators/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("creators")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: "admin" })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Creator approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/creators/:id/reject
app.put("/api/admin/creators/:id/reject", requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const { error } = await supabase
      .from("creators")
      .update({ status: "rejected", rejection_reason: reason || "Does not meet guidelines" })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Creator rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/reviews/pending
app.get("/api/admin/reviews/pending", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, users(name, headline, connections_count, linkedin_created_at), creators(name)")
      .in("status", ["pending", "flagged"])
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/reviews/:id/approve
app.put("/api/admin/reviews/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("reviews")
      .update({ status: "approved" })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Review approved and published" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/reviews/:id/reject
app.put("/api/admin/reviews/:id/reject", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("reviews")
      .update({ status: "rejected" })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Review rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [creators, reviews, users, flagged] = await Promise.all([
      supabase.from("creators").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "flagged"),
    ]);

    res.json({
      approved_creators: creators.count,
      approved_reviews: reviews.count,
      total_users: users.count,
      flagged_reviews: flagged.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUTH: LinkedIn OAuth callback (OpenID Connect)
// ============================================
app.post("/api/auth/linkedin", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Authorization code required" });

    // Step 1 — Exchange code for access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token from LinkedIn" });
    }
    const access_token = tokenData.access_token;

    // Step 2 — Get user profile via OpenID Connect userinfo endpoint
   // Step 2 — Get user profile via OpenID Connect userinfo endpoint
const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
  headers: { Authorization: `Bearer ${access_token}` },
});
const userInfo = await userInfoRes.json();

// Step 2b — Get additional profile data (headline)
let headline = "";
try {
  const profileRes = await fetch("https://api.linkedin.com/v2/me?projection=(id,localizedHeadline)", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profileData = await profileRes.json();
  headline = profileData.localizedHeadline || "";
} catch (e) {
  headline = "";
}

    // userInfo contains: sub, name, given_name, family_name, email, picture
    const linkedin_id = userInfo.sub;
    const name = userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`;
    const email = userInfo.email;
    const profile_picture = userInfo.picture;

    if (!linkedin_id) {
      return res.status(400).json({ error: "Could not get LinkedIn profile" });
    }

    // Step 3 — Upsert user in Supabase
const { data: user, error: userError } = await supabase
  .from("users")
  .upsert({
    linkedin_id,
    name,
    email,
    profile_picture,
    headline,
    profile_url: `https://www.linkedin.com/in/${linkedin_id}`,
    last_login: new Date().toISOString(),
  }, { onConflict: "linkedin_id" })
  .select()
  .single()

    if (userError) throw userError;

    // Step 4 — Generate a simple JWT-like token using Supabase
    // We sign the user id so frontend can use it for authenticated requests
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email || `${linkedin_id}@linkedin.ratemyguru.in`,
      options: { data: { linkedin_id, user_id: user.id } },
    });

    if (sessionError) throw sessionError;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
        headline: user.headline,
        connections_count: user.connections_count,
      },
      token: user.id,  // use user ID as token
    });

  } catch (err) {
    console.error("LinkedIn auth error:", err);
    res.status(500).json({ error: err.message });
  }
});
// In server.js - add this route
app.get("/api/sync/creator/:id", requireAdmin, async (req, res) => {
  const { data: creator } = await supabase
    .from("creators")
    .select("youtube_id")
    .eq("id", req.params.id)
    .single();

  const ytRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=${creator.youtube_id}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const ytData = await ytRes.json();
  const subscribers = ytData.items?.[0]?.statistics?.subscriberCount;

  await supabase.from("creators").update({ 
    subscribers: formatCount(subscribers)
  }).eq("id", req.params.id);

  res.json({ subscribers });
});

// DELETE /api/admin/creators/:id/delete
app.put("/api/admin/creators/:id/delete", requireAdmin, async (req, res) => {
  try {
    const creatorId = req.params.id;

    const { data: reviewIds } = await supabase
      .from("reviews").select("id").eq("creator_id", creatorId);
    const ids = (reviewIds || []).map(r => r.id);

    if (ids.length > 0) {
      await supabase.from("review_flags").delete().in("review_id", ids);
      await supabase.from("review_votes").delete().in("review_id", ids);
    }

    await supabase.from("reviews").delete().eq("creator_id", creatorId);
    await supabase.from("creator_submissions").delete().eq("creator_id", creatorId);

    const { error } = await supabase.from("creators").delete().eq("id", creatorId);
    if (error) throw error;

    res.json({ message: "Creator deleted permanently" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// START
// ============================================
app.listen(PORT, () => {
  console.log(`✅ LearnRate API running on port ${PORT}`);
});

export default app;
