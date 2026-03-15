import { useState, useEffect } from "react";
import { loginWithLinkedIn, getUser, logout } from './utils/auth';

const CATEGORIES = ["All", "Data Engineering", "DSA & Algorithms", "Web Development", "Machine Learning", "System Design", "DevOps", "UI/UX Design", "Digital Marketing", "Python", "Java"];
const COUNTRIES = ["All Countries", "India", "USA", "UK", "Canada", "Australia"];
const INDIA_STATES = ["All States", "Tamil Nadu", "Maharashtra", "Karnataka", "Delhi", "Telangana", "Kerala", "Gujarat", "West Bengal", "Rajasthan", "Punjab"];

const MOCK_CREATORS = [
  {
    id: 1, name: "Gowtham SB", handle: "@dataengineeringtamil", platform: "YouTube",
    platformId: "dataengineeringvideos", category: "Data Engineering",
    country: "India", state: "Tamil Nadu", subscribers: "300K+",
    avatar: "G", color: "#FF6B35",
    bio: "First Tamil Data Engineering community. Teaching Spark, Kafka, Cloud in Tanglish.",
    rating: 4.8, reviewCount: 1240, verified: true,
    tags: ["PySpark", "Kafka", "BigQuery", "Tamil"],
  },
  {
    id: 2, name: "Striver", handle: "@takeUforward", platform: "YouTube",
    platformId: "takeUforward", category: "DSA & Algorithms",
    country: "India", state: "West Bengal", subscribers: "1.1M+",
    avatar: "S", color: "#0EA5E9",
    bio: "DSA sheet, SDE interview prep. Trusted by lakhs of students across India.",
    rating: 4.9, reviewCount: 8920, verified: true,
    tags: ["DSA", "Competitive", "Interview", "C++"],
  },
  {
    id: 3, name: "Hitesh Choudhary", handle: "@HiteshChoudhary", platform: "YouTube",
    platformId: "HiteshChoudharyDotCom", category: "Web Development",
    country: "India", state: "Rajasthan", subscribers: "900K+",
    avatar: "H", color: "#8B5CF6",
    bio: "Chai aur code. Full stack, JavaScript, React and more in Hindi.",
    rating: 4.7, reviewCount: 3410, verified: true,
    tags: ["JavaScript", "React", "Node", "Hindi"],
  },
  {
    id: 4, name: "Krish Naik", handle: "@krishnaik06", platform: "YouTube",
    platformId: "krishnaik06", category: "Machine Learning",
    country: "India", state: "West Bengal", subscribers: "850K+",
    avatar: "K", color: "#10B981",
    bio: "Chief ML Engineer. End-to-end ML/DL projects, MLOps, GenAI tutorials.",
    rating: 4.6, reviewCount: 2780, verified: true,
    tags: ["ML", "Deep Learning", "GenAI", "MLOps"],
  },
  {
    id: 5, name: "Traversy Media", handle: "@TraversyMedia", platform: "YouTube",
    platformId: "TraversyMedia", category: "Web Development",
    country: "USA", state: "All States", subscribers: "2.1M+",
    avatar: "T", color: "#F59E0B",
    bio: "Practical project-based tutorials for web developers worldwide.",
    rating: 4.8, reviewCount: 5600, verified: true,
    tags: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 6, name: "Piyush Garg", handle: "@piyushgarg_dev", platform: "Instagram",
    platformId: "piyushgarg_dev", category: "DevOps",
    country: "India", state: "Delhi", subscribers: "180K+",
    avatar: "P", color: "#EC4899",
    bio: "DevOps, Docker, Kubernetes explained simply for Indian developers.",
    rating: 4.5, reviewCount: 890, verified: false,
    tags: ["Docker", "Kubernetes", "CI/CD", "AWS"],
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --saffron: #FF6B35;
    --saffron-light: #FFF0EB;
    --saffron-mid: #FFD4C2;
    --navy: #0F1729;
    --navy-mid: #1E2D4E;
    --navy-light: #2A3F6B;
    --white: #FFFFFF;
    --gray-50: #F8F9FC;
    --gray-100: #F1F3F9;
    --gray-200: #E2E8F0;
    --gray-400: #94A3B8;
    --gray-600: #475569;
    --gray-800: #1E293B;
    --green: #10B981;
    --font-display: 'Fraunces', serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body { font-family: var(--font-body); background: var(--gray-50); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  .card-hover {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(255,107,53,0.12);
    border-color: var(--saffron) !important;
    background: #FFFBF9 !important;
  }

  .tag {
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
    font-family: var(--font-body);
  }

  .btn-primary {
    background: var(--saffron);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--font-body);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-primary:hover { background: #e55a24; transform: translateY(-1px); }

  .btn-outline {
    background: transparent;
    color: var(--navy);
    border: 1.5px solid var(--gray-200);
    border-radius: 10px;
    font-family: var(--font-body);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-outline:hover { border-color: var(--saffron); color: var(--saffron); }

  .filter-pill {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1.5px solid var(--gray-200);
    background: white;
    color: var(--gray-600);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .filter-pill:hover { border-color: var(--saffron); color: var(--saffron); }
  .filter-pill.active { background: var(--saffron-light); border-color: var(--saffron); color: var(--saffron); }

  select {
    padding: 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--gray-800);
    outline: none;
    background: white;
    cursor: pointer;
  }
  select:focus { border-color: var(--saffron); }

  input:focus { border-color: var(--saffron) !important; }

  textarea:focus { border-color: var(--saffron) !important; outline: none; }

  .star-interactive:hover { transform: scale(1.15); }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,41,0.7);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
    animation: fadeUp 0.15s ease;
  }

  .modal-box {
    background: white;
    border-radius: 20px;
    width: 100%; max-width: 580px;
    max-height: 88vh; overflow-y: auto;
    box-shadow: 0 32px 80px rgba(0,0,0,0.3);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 10px; }
`;

function Logo({ size = "md", light = false }) {
  const s = size === "lg" ? 40 : size === "sm" ? 28 : 34;
  const fs = size === "lg" ? 26 : size === "sm" ? 18 : 22;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: s, height: s,
        background: "linear-gradient(135deg, #FF6B35 0%, #FF9A6C 100%)",
        borderRadius: size === "sm" ? 8 : 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(255,107,53,0.35)",
      }}>
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: fs, color: light ? "#FFFFFF" : "#0F1729", lineHeight: 1 }}>
		RateMyGuru
		</div>
        {size !== "sm" && <div style={{ fontSize: 9, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, fontWeight: 600 }}>RATEMYGURU.IN</div>}
      </div>
    </div>
  );
}

function StarRating({ rating = 0, size = "sm" }) {
  const sz = size === "lg" ? 20 : 13;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={sz} height={sz} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#FF6B35" : "#E2E8F0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: size === "lg" ? 15 : 12, color: "#94A3B8", marginLeft: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PlatformBadge({ platform }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: platform === "YouTube" ? "#FEE2E2" : "#FCE7F3",
      color: platform === "YouTube" ? "#DC2626" : "#BE185D",
      fontSize: 10, fontWeight: 700,
      padding: "3px 9px", borderRadius: 20,
      fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
    }}>
      {platform === "YouTube" ? "▶ YouTube" : "◈ Instagram"}
    </div>
  );
}

function CreatorCard({ creator, onClick }) {
  return (
    <div className="card-hover" onClick={() => onClick(creator)} style={{
      background: "white", border: "1.5px solid #E2E8F0",
      borderRadius: 16, padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${creator.color || "#FF6B35"}, ${(creator.color || "#FF6B35")}88)` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: (creator.color || "#FF6B35") + "18",
            border: `2px solid ${(creator.color || "#FF6B35")}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: creator.color || "#FF6B35",
            fontFamily: "'Fraunces', serif", overflow: "hidden",
          }}>
            {creator.profile_picture
              ? <img src={creator.profile_picture} alt={creator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (creator.avatar_letter || creator.avatar || creator.name?.[0] || "?")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 15, color: "#0F1729" }}>{creator.name}</span>
              {creator.verified && (
                <div title="Verified" style={{ width: 16, height: 16, background: "#0EA5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
            <a href={creator.platform === "YouTube"
                ? `https://www.youtube.com/@${creator.youtube_id || creator.platformId}`
                : `https://www.instagram.com/${creator.instagram_id || creator.platformId}`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 13, color: "#FF6B35", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
              {creator.handle || (creator.youtube_id ? `@${creator.youtube_id}` : `@${creator.instagram_id}`)}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
              📍 {creator.state !== "All States" ? `${creator.state}, ` : ""}{creator.country} · {creator.subscribers}
            </div>
          </div>
        </div>
        <PlatformBadge platform={creator.platform} />
      </div>

      <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
        {creator.bio}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {creator.tags?.map(t => <span key={t} className="tag">{t}</span>)}
      </div>

      <div style={{ paddingTop: 14, borderTop: "1px solid #F1F3F9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <StarRating rating={creator.rating || creator.avg_rating || 0} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
              {(creator.reviewCount || creator.review_count || 0).toLocaleString()} reviews
            </span>
          </div>
        </div>
        
          href={creator.platform === "YouTube"
            ? `https://www.youtube.com/@${creator.youtube_id || creator.platformId}`
            : `https://www.instagram.com/${creator.instagram_id || creator.platformId}`}
          target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: creator.platform === "YouTube" ? "#FEE2E2" : "#FCE7F3",
            color: creator.platform === "YouTube" ? "#DC2626" : "#BE185D",
            padding: "10px 0", borderRadius: 10, width: "100%",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
            textDecoration: "none",
          }}>
          {creator.platform === "YouTube" ? "▶ Visit YouTube Channel" : "◈ Visit Instagram Profile"}
        </a>
      </div>
    </div>
  );
}

const SAMPLE_REVIEWS = [
  { name: "Arjun R.", role: "Data Engineer @ TCS", rating: 5, text: "Best Tamil content for data engineering. Anna explains Spark with real-world examples. Cleared my interview because of this channel!", date: "2 days ago", likes: 34, verified: true },
  { name: "Priya M.", role: "Student, Anna University", rating: 5, text: "PySpark and SQL content is gold. The Tanglish teaching style makes complex topics super easy to understand.", date: "1 week ago", likes: 21, verified: false },
  { name: "Karthik S.", role: "Senior DE @ Infosys", rating: 4, text: "Great content overall. Would love more cloud-native topics in future. Solid channel for Tamil-speaking data folks.", date: "2 weeks ago", likes: 15, verified: true },
];

function ReviewModal({ creator, onClose }) {
  // Normalize API fields
  const c = {
    ...creator,
    rating: creator.rating || creator.avg_rating || 0,
    reviewCount: creator.reviewCount || creator.review_count || 0,
    color: creator.color || creator.avatar_color || "#FF6B35",
    avatar: creator.avatar_letter || creator.avatar || creator.name?.[0] || "?",
  };

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (c.id) {
      fetch(`https://ratemyguru-production.up.railway.app/api/creators/${c.id}/reviews`)
        .then(r => r.json())
        .then(data => {
          setReviews(data.reviews || []);
          setReviewsLoading(false);
        })
        .catch(() => setReviewsLoading(false));
    } else {
      setReviewsLoading(false);
    }
  }, [c.id]);

  if (!creator) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: c.color + "18", border: `2px solid ${c.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: c.color,
                fontFamily: "'Fraunces', serif",
              }}>{c.avatar}</div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 18, color: "#0F1729", marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{c.category} · {c.country}</div>
                <StarRating rating={c.rating} size="lg" />
              </div>
            </div>
            <button onClick={onClose} style={{ background: "#F1F3F9", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: 8, fontSize: 16, color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          <div style={{ background: "#FFFBF9", border: "1.5px solid #FFD4C2", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ textAlign: "center", minWidth: 70 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 800, color: "#0F1729", lineHeight: 1 }}>{c.rating}</div>
              <StarRating rating={c.rating} />
              <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{c.reviewCount.toLocaleString()} reviews</div>
            </div>
            <div style={{ flex: 1 }}>
              {[5,4,3,2,1].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8", width: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{s}</span>
                  <div style={{ flex: 1, height: 7, background: "#F1F3F9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: s === 5 ? "#FF6B35" : s === 4 ? "#FF9A6C" : "#FFD4C2", borderRadius: 4, width: s === 5 ? "72%" : s === 4 ? "18%" : s === 3 ? "7%" : "2%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", borderBottom: "2px solid #F1F3F9" }}>
            {[["reviews", `Reviews (${c.reviewCount.toLocaleString()})`], ["write", "Write a Review"]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 20px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
                color: activeTab === tab ? "#FF6B35" : "#94A3B8",
                borderBottom: `2px solid ${activeTab === tab ? "#FF6B35" : "transparent"}`,
                marginBottom: -2, transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 24px 28px" }}>
          {activeTab === "reviews" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {reviewsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: "#0F1729", marginBottom: 6 }}>No reviews yet</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>Be the first to review this creator!</div>
                </div>
              ) : reviews.map((r, i) => (
                <div key={i} style={{ paddingBottom: 18, borderBottom: i < reviews.length - 1 ? "1px solid #F1F3F9" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F1F3F9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 14, color: "#0F1729" }}>
                        {r.users?.name?.[0] || "U"}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <a href={r.users?.profile_url || `https://www.linkedin.com/search/results/people/?keywords=${r.users?.name}`}
  target="_blank" rel="noopener noreferrer"
  style={{ fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#0F1729", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
  {r.users?.name || "User"}
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2" fill="#0A66C2"/>
  </svg>
</a>
                          {r.is_verified_learner && <span style={{ fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "1px 7px", borderRadius: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>✓ Verified</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{r.users?.headline || ""}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} />
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: "10px 0", fontFamily: "'DM Sans', sans-serif" }}>{r.text}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer", color: "#475569", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>👍 {r.upvotes || 0}</button>
                    <button style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>Flag</button>
                  </div>
                </div>
              ))}
            </div>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: "#0F1729", marginBottom: 8 }}>Review Submitted!</div>
              <div style={{ fontSize: 14, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>Our team will review and publish it within 24 hours.</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#1E293B", marginBottom: 10 }}>Your Rating *</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width={36} height={36} viewBox="0 0 24 24"
                      fill={(hoverRating || rating) >= s ? "#FF6B35" : "#E2E8F0"}
                      className="star-interactive"
                      style={{ cursor: "pointer", transition: "all 0.1s" }}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                  {rating > 0 && <span style={{ fontSize: 13, color: "#FF6B35", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, alignSelf: "center" }}>
                    {["","Terrible","Bad","Okay","Good","Excellent!"][rating]}
                  </span>}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#1E293B", marginBottom: 8 }}>
                  Your Review * <span style={{ fontWeight: 500, color: "#94A3B8" }}>(min 50 characters)</span>
                </div>
                <textarea value={review} onChange={e => setReview(e.target.value)}
                  placeholder="Share your honest experience — what did you learn? Would you recommend this creator?"
                  style={{ width: "100%", minHeight: 120, padding: "12px 14px", border: "1.5px solid #E2E8F0", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1E293B", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
                <div style={{ fontSize: 11, color: review.length >= 50 ? "#10B981" : "#94A3B8", textAlign: "right", fontFamily: "'DM Sans', sans-serif", marginTop: 4, fontWeight: 600 }}>
                  {review.length} / 50 min {review.length >= 50 ? "✓" : ""}
                </div>
              </div>
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#1E40AF", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span>🔒</span>
                <span>Login with LinkedIn required. Your professional profile (name + role) will be shown with your review — this keeps reviews honest and trusted.</span>
              </div>
              <button className="btn-primary"
                onClick={async () => {
                  if (review.length < 50 || rating === 0) return;
                  const token = localStorage.getItem("rmg_token");
                  if (!token) {
                    alert("Please login with LinkedIn first!");
                    return;
                  }
                  try {
                    const res = await fetch(`https://ratemyguru-production.up.railway.app/api/creators/${c.id}/reviews`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      },
                      body: JSON.stringify({ rating, text: review }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setSubmitted(true);
                    } else {
                      alert(data.error || "Something went wrong!");
                    }
                  } catch (err) {
                    alert("Something went wrong. Try again.");
                  }
                }}
                style={{ width: "100%", padding: 14, fontSize: 15, opacity: review.length >= 50 && rating > 0 ? 1 : 0.5, cursor: review.length >= 50 && rating > 0 ? "pointer" : "not-allowed" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" fill="white"/></svg>
                  Login with LinkedIn & Submit Review
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddCreatorModal({ onClose }) {
  const [form, setForm] = useState({ name: "", platform: "YouTube", youtube_id: "", instagram_id: "", category: "", customCategory: undefined, country: "India", state: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);

const handleSubmit = async () => {
  const token = localStorage.getItem("rmg_token");
  if (!token) {
    alert("Please login with LinkedIn first!");
    onClose();
    return;
  }

  console.log("Form data:", form); // ADD THIS
  console.log("Token:", token); // ADD THIS

  setChecking(true);
  try {
    const res = await fetch("https://ratemyguru-production.up.railway.app/api/creators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(form),
    });
    
    const data = await res.json();
    console.log("Response:", data); // ADD THIS
    
    if (res.status === 409) {
      alert(`Duplicate! ${data.duplicate.name} already exists.`);
      setChecking(false);
      return;
    }
    if (res.status === 400) {
      alert(`Validation error: ${data.error}`);
      setChecking(false);
      return;
    }
    setChecking(false);
    setSubmitted(true);
  } catch (err) {
    alert("Something went wrong. Try again.");
    setChecking(false);
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 20, color: "#0F1729" }}>Add a Creator</div>
              <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Help the community discover great educators</div>
            </div>
            <button onClick={onClose} style={{ background: "#F1F3F9", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: 8, fontSize: 16, color: "#94A3B8" }}>✕</button>
          </div>

          {checking ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 800, color: "#0F1729", marginBottom: 8 }}>Checking for duplicates...</div>
              <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>Verifying YouTube & Instagram IDs</div>
            </div>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🚀</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 800, color: "#0F1729", marginBottom: 8 }}>Submitted Successfully!</div>
              <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>No duplicates found. Our team will verify and approve within 24 hours.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>CREATOR NAME *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Gowtham SB"
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Platform */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>PLATFORM *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["YouTube", "Instagram", "Both"].map(p => (
                    <button key={p} onClick={() => setForm({...form, platform: p})} style={{
                      flex: 1, padding: "9px 0", border: "1.5px solid",
                      borderColor: form.platform === p ? "#FF6B35" : "#E2E8F0",
                      background: form.platform === p ? "#FFF0EB" : "white",
                      color: form.platform === p ? "#FF6B35" : "#94A3B8",
                      borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700, fontSize: 12, cursor: "pointer",
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Platform IDs */}
              {(form.platform === "YouTube" || form.platform === "Both") && (
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>YOUTUBE CHANNEL ID *</label>
                  <input value={form.youtube_id} onChange={e => setForm({...form, youtube_id: e.target.value})} placeholder="e.g. dataengineeringvideos"
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              {(form.platform === "Instagram" || form.platform === "Both") && (
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>INSTAGRAM HANDLE *</label>
                  <input value={form.instagram_id} onChange={e => setForm({...form, instagram_id: e.target.value})} placeholder="e.g. dataengineeringtamil"
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              )}

              {/* Category + Country */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>CATEGORY *</label>
                  <select value={form.category} onChange={e => {
  if (e.target.value === "other") {
    setForm({...form, category: ""});
  } else {
    setForm({...form, category: e.target.value, customCategory: ""});
  }
}} style={{ width: "100%" }}>
  <option value="">Select...</option>
  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
  <option value="other">➕ Add Custom Category</option>
</select>

{form.category === "" && form.customCategory !== undefined && (
  <input
    value={form.customCategory || ""}
    onChange={e => setForm({...form, customCategory: e.target.value, category: e.target.value})}
    placeholder="Type your category e.g. Blockchain, Cybersecurity..."
    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #FF6B35", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 8 }}
  />
)}
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>COUNTRY *</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} style={{ width: "100%" }}>
                    {COUNTRIES.filter(c => c !== "All Countries").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {form.country === "India" && (
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>STATE</label>
                  <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={{ width: "100%" }}>
                    {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>BIO *</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief description of the creator and their content..."
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1E293B", minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <div style={{ background: "#FFFBF9", border: "1.5px solid #FFD4C2", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                ⚡ We auto-check YouTube & Instagram IDs to prevent duplicates. Existing creators will be rejected instantly.
              </div>

              <button className="btn-primary" onClick={handleSubmit} style={{ padding: 14, fontSize: 14 }}>
                Submit for Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RateMyGuru() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedState, setSelectedState] = useState("All States");
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showAddCreator, setShowAddCreator] = useState(false);
  const [sort, setSort] = useState("rating");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(getUser());
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const handleLogout = () => { logout(); setUser(null); };

  useEffect(() => {
  setTimeout(() => setLoaded(true), 100);
  fetch("https://ratemyguru-production.up.railway.app/api/creators")
    .then(r => r.json())
    .then(data => {
      setCreators(data.creators || []);
      setCreatorsLoading(false);
    })
    .catch(() => {
      setCreators([]);
      setCreatorsLoading(false);
    });
}, []);

  const filtered = creators.filter(c => {
    const matchCat = selectedCategory === "All" || c.category === selectedCategory;
    const matchCountry = selectedCountry === "All Countries" || c.country === selectedCountry;
    const matchState = selectedState === "All States" || c.state === selectedState;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchCountry && matchState && matchSearch;
  }).sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "reviews" ? b.reviewCount - a.reviewCount : 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <style>{styles}</style>

      {/* Navbar */}
      <nav style={{ background: "white", borderBottom: "1.5px solid #E2E8F0", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-outline" onClick={() => setShowAddCreator(true)} style={{ padding: "9px 18px", fontSize: 13 }}>
            + Add Creator
          </button>
        {user ? (
  <button className="btn-outline" onClick={handleLogout} style={{ padding: "9px 18px", fontSize: 13 }}>
    👋 {user.name.split(" ")[0]} · Logout
  </button>
) : (
  <a href={`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86nqmaogrsbobc&redirect_uri=${encodeURIComponent('https://ratemyguru.in/auth/linkedin/callback')}&scope=openid%20profile%20email&state=xyz123`}
    style={{ padding: "9px 18px", fontSize: 13, background: "#FF6B35", color: "white", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
    Login with LinkedIn
  </a>
)}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #0F1729 0%, #1E2D4E 60%, #2A3F6B 100%)", padding: "60px 28px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* BG decoration */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 60%, rgba(255,107,53,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.1) 0%, transparent 40%)" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.1)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.08)" }} />

        <div style={{ position: "relative", maxWidth: 660, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 22 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B35" }} />
            <span style={{ fontSize: 11, color: "#FF9A6C", fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>INDIA'S #1 EDTECH CREATOR REVIEW PLATFORM</span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "clamp(26px, 5vw, 46px)", color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>
            Find Your Perfect Guru.<br />
            <span style={{ color: "#FF6B35" }}>No Fake Reviews. Ever.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
            Real reviews from verified LinkedIn professionals for YouTube & Instagram edtech creators across India and beyond.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 520, margin: "0 auto 32px", position: "relative" }}>
            <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search creators, topics, skills, language..."
              style={{ width: "100%", padding: "16px 18px 16px 48px", borderRadius: 14, border: "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#0F1729", outline: "none", boxSizing: "border-box", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", fontWeight: 500 }} />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
  {[["100% Free", "Always"], ["LinkedIn Verified", "Reviews Only"]].map(([num, label]) => (
    <div key={label} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 800, color: "#FF6B35" }}>{num}</div>
      <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{label}</div>
    </div>
  ))}
</div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: "white", borderBottom: "1.5px solid #E2E8F0", padding: "14px 28px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedState("All States"); }}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {selectedCountry === "India" && (
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)}>
            {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
        <div style={{ width: 1, height: 28, background: "#E2E8F0", margin: "0 4px" }} />
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Creator Grid */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 20, color: "#0F1729" }}>
              {filtered.length} Guru{filtered.length !== 1 ? "s" : ""} Found
            </span>
            {selectedCategory !== "All" && <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 10, fontFamily: "'DM Sans', sans-serif" }}>in {selectedCategory}</span>}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>

        {creatorsLoading ? (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 800, color: "#0F1729" }}>Loading Gurus...</div>
  </div>
) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: "#0F1729", marginBottom: 8 }}>No Gurus Found</div>
            <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>Be the first to add this creator to RateMyGuru!</div>
            <button className="btn-primary" onClick={() => setShowAddCreator(true)} style={{ padding: "12px 24px", fontSize: 14 }}>+ Add Creator</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18 }}>
            {filtered.map((c, i) => (
              <div key={c.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
                <CreatorCard creator={c} onClick={setSelectedCreator} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: "#0F1729", padding: "32px 28px", marginTop: 40 }}>
  <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
    <Logo size="sm" light={true} />
    <div style={{ fontSize: 13, color: "#475569", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
      Honest reviews. Verified learners. Zero fake gurus. 🎯
    </div>
    <div style={{ fontSize: 12, color: "#2A3F6B", fontFamily: "'DM Sans', sans-serif" }}>
      © 2026 RateMyGuru.in · 100% Free Forever
    </div>
  </div>
</footer>

      {selectedCreator && <ReviewModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />}
      {showAddCreator && <AddCreatorModal onClose={() => setShowAddCreator(false)} />}
    </div>
  );
}