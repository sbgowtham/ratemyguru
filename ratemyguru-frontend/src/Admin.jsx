import { useState, useEffect, useCallback } from "react";

const API_URL = "https://ratemyguru-production.up.railway.app";
const ADMIN_KEY = process.env.REACT_APP_ADMIN_KEY || "ratemyguru-admin-2026";

async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY,
      ...options.headers,
    },
  });
  return res.json();
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #0A0F1E; --surface: #111827; --surface2: #1F2937;
    --border: #1F2937; --border2: #374151;
    --saffron: #FF6B35; --saffron-dim: rgba(255,107,53,0.12);
    --green: #10B981; --green-dim: rgba(16,185,129,0.12);
    --red: #EF4444; --red-dim: rgba(239,68,68,0.12);
    --yellow: #F59E0B; --yellow-dim: rgba(245,158,11,0.12);
    --blue: #3B82F6; --blue-dim: rgba(59,130,246,0.12);
    --text: #F9FAFB; --text2: #9CA3AF; --text3: #6B7280;
    --font-display: 'Fraunces', serif; --font-body: 'DM Sans', sans-serif;
  }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.25s ease both; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; transition: border-color 0.15s; }
  .stat-card:hover { border-color: var(--border2); }
  .btn { border: none; border-radius: 8px; cursor: pointer; font-family: var(--font-body); font-weight: 700; font-size: 13px; padding: 8px 16px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-approve { background: var(--green-dim); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
  .btn-approve:hover { background: var(--green); color: white; }
  .btn-reject { background: var(--red-dim); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }
  .btn-reject:hover { background: var(--red); color: white; }
  .btn-view { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.25); }
  .btn-view:hover { background: var(--blue); color: white; }
  .btn-delete { background: rgba(239,68,68,0.2); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.3); }
  .btn-delete:hover { background: var(--red); color: white; }
  .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; font-family: var(--font-body); }
  .badge-pending { background: var(--yellow-dim); color: var(--yellow); }
  .badge-approved { background: var(--green-dim); color: var(--green); }
  .badge-rejected { background: var(--red-dim); color: var(--red); }
  .badge-flagged { background: rgba(239,68,68,0.2); color: #FCA5A5; }
  .badge-youtube { background: rgba(220,38,38,0.12); color: #F87171; }
  .badge-instagram { background: rgba(236,72,153,0.12); color: #F9A8D4; }
  .table-row { border-bottom: 1px solid var(--border); transition: background 0.12s; }
  .table-row:hover { background: rgba(255,255,255,0.02); }
  .table-row:last-child { border-bottom: none; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.12s; font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--text2); border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--saffron-dim); color: var(--saffron); }
  .search-input { background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 9px 14px 9px 38px; color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; width: 260px; }
  .search-input::placeholder { color: var(--text3); }
  .search-input:focus { border-color: var(--saffron); }
  .tab { padding: 8px 18px; border-radius: 8px; cursor: pointer; font-family: var(--font-body); font-weight: 600; font-size: 13px; border: none; transition: all 0.12s; color: var(--text2); background: none; }
  .tab.active { background: var(--saffron-dim); color: var(--saffron); }
  .tab:hover:not(.active) { background: var(--surface2); color: var(--text); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 18px; width: 100%; max-width: 540px; max-height: 85vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.5); animation: fadeUp 0.2s ease; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,107,53,0.3); border-top-color: var(--saffron); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  .login-box { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
`;

const MOCK_STATS = { approved_creators: 0, approved_reviews: 0, total_users: 0, flagged_reviews: 0 };

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #FF6B35, #FF9A6C)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(255,107,53,0.3)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--text)", lineHeight: 1 }}>RateMyGuru</div>
        <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "var(--font-body)", letterSpacing: 1, fontWeight: 600 }}>ADMIN PANEL</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, change }) {
  return (
    <div className="stat-card fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        {change && <span style={{ fontSize: 11, color: "var(--green)", background: "var(--green-dim)", padding: "3px 8px", borderRadius: 20, fontWeight: 700, fontFamily: "var(--font-body)" }}>+{change}</span>}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{value?.toLocaleString() ?? "—"}</div>
      <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function CreatorRejectModal({ creator, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Reject Creator</div>
        <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginBottom: 20 }}>Rejecting <strong style={{ color: "var(--text)" }}>{creator.name}</strong> — provide a reason</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {["Duplicate creator", "Insufficient content", "Not an edtech creator", "Fake/spam submission", "Other"].map(r => (
            <button key={r} onClick={() => setReason(r)} style={{ padding: "10px 14px", border: "1px solid", borderColor: reason === r ? "var(--saffron)" : "var(--border2)", background: reason === r ? "var(--saffron-dim)" : "transparent", color: reason === r ? "var(--saffron)" : "var(--text2)", borderRadius: 9, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", transition: "all 0.12s" }}>{r}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-reject" style={{ flex: 1, justifyContent: "center", opacity: reason ? 1 : 0.4 }} onClick={() => reason && onConfirm(reason)}>Confirm Reject</button>
          <button className="btn btn-view" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PENDING CREATORS TAB
// ============================================
function CreatorsTab({ creators, setCreators, loading }) {
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const handleApprove = async (id) => {
    setActionLoading(id);
    await adminFetch(`/api/admin/creators/${id}/approve`, { method: "PUT" });
    setCreators(prev => prev.filter(c => c.id !== id));
    setActionLoading(null);
  };

  const handleReject = async (id, reason) => {
    setActionLoading(id);
    await adminFetch(`/api/admin/creators/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) });
    setCreators(prev => prev.filter(c => c.id !== id));
    setRejectModal(null);
    setActionLoading(null);
  };

  const filtered = creators.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>Pending Creators</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 2 }}>{filtered.length} awaiting approval</div>
        </div>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>All caught up!</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 6 }}>No pending creator submissions</div>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            {["Creator", "Platform", "Category", "Submitted by", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {filtered.map((c, i) => (
            <div key={c.id} className="table-row fade-up" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 16, padding: "16px 20px", alignItems: "center", animationDelay: `${i * 0.05}s` }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>{c.youtube_id ? `yt: ${c.youtube_id}` : `ig: ${c.instagram_id}`}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>📍 {c.state ? `${c.state}, ` : ""}{c.country}</div>
              </div>
              <div><span className={`badge badge-${c.platform?.toLowerCase()}`}>{c.platform === "YouTube" ? "▶" : "◈"} {c.platform}</span></div>
              <div style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-body)" }}>{c.category}</div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-body)", fontWeight: 600 }}>{c.users?.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>{new Date(c.submitted_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {actionLoading === c.id ? <div className="spinner" /> : (
                  <>
                    <button className="btn btn-approve" onClick={() => handleApprove(c.id)}>✓ Approve</button>
                    <button className="btn btn-reject" onClick={() => setRejectModal(c)}>✕ Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {rejectModal && <CreatorRejectModal creator={rejectModal} onConfirm={(reason) => handleReject(rejectModal.id, reason)} onClose={() => setRejectModal(null)} />}
    </div>
  );
}

// ============================================
// ALL CREATORS TAB (approved + delete)
// ============================================
function AllCreatorsTab() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/creators?limit=100`)
      .then(r => r.json())
      .then(data => { setCreators(data.creators || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" permanently? This cannot be undone!`)) return;
    setActionLoading(id);
    await adminFetch(`/api/admin/creators/${id}/delete`, { method: "DELETE" });
    setCreators(prev => prev.filter(c => c.id !== id));
    setActionLoading(null);
  };

  const filtered = creators.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>All Approved Creators</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 2 }}>{filtered.length} creators live on platform</div>
        </div>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>No creators yet</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 6 }}>Approve pending creators to see them here</div>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            {["Creator", "Platform", "Category", "Rating", "Action"].map(h => (
              <div key={h} style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {filtered.map((c, i) => (
            <div key={c.id} className="table-row fade-up" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 16, padding: "16px 20px", alignItems: "center", animationDelay: `${i * 0.05}s` }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>
                  {c.youtube_id ? `yt: ${c.youtube_id}` : c.instagram_id ? `ig: ${c.instagram_id}` : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>📍 {c.state ? `${c.state}, ` : ""}{c.country}</div>
              </div>
              <div><span className={`badge badge-${c.platform?.toLowerCase()}`}>{c.platform === "YouTube" ? "▶" : "◈"} {c.platform}</span></div>
              <div style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-body)" }}>{c.category}</div>
              <div>
                <div style={{ fontSize: 13, color: "var(--saffron)", fontFamily: "var(--font-body)", fontWeight: 700 }}>
                  ⭐ {c.avg_rating || "0.0"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>{c.review_count || 0} reviews</div>
              </div>
              <div>
                {actionLoading === c.id ? <div className="spinner" /> : (
                  <button className="btn btn-delete" onClick={() => handleDelete(c.id, c.name)}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// REVIEWS TAB
// ============================================
function ReviewsTab({ reviews, setReviews, loading }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const handleApprove = async (id) => {
    setActionLoading(id);
    await adminFetch(`/api/admin/reviews/${id}/approve`, { method: "PUT" });
    setReviews(prev => prev.filter(r => r.id !== id));
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    await adminFetch(`/api/admin/reviews/${id}/reject`, { method: "PUT" });
    setReviews(prev => prev.filter(r => r.id !== id));
    setActionLoading(null);
  };

  const filtered = reviews
    .filter(r => tab === "all" || r.status === tab)
    .filter(r => !search || r.users?.name?.toLowerCase().includes(search.toLowerCase()) || r.creators?.name?.toLowerCase().includes(search.toLowerCase()));

  function RatingStars({ rating }) {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= rating ? "#FF6B35" : "#374151"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>Review Moderation</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 2 }}>{filtered.length} reviews to moderate</div>
        </div>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["all", "All"], ["pending", "Pending"], ["flagged", "🚩 Flagged"]].map(([val, label]) => (
          <button key={val} className={`tab ${tab === val ? "active" : ""}`} onClick={() => setTab(val)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>All clear!</div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginTop: 6 }}>No reviews in this queue</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r, i) => (
            <div key={r.id} className="fade-up" style={{ background: "var(--surface)", border: `1px solid ${r.status === "flagged" ? "rgba(239,68,68,0.3)" : "var(--border)"}`, borderRadius: 14, padding: 20, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--saffron)", flexShrink: 0 }}>
                    {r.users?.name?.[0] || "?"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{r.users?.name}</span>
                      <span className={`badge badge-${r.status}`}>{r.status === "flagged" ? "🚩 Flagged" : "⏳ Pending"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-body)" }}>
                      {r.users?.headline || "No headline"} · {r.users?.connections_count || 0} connections
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--saffron)", fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 4 }}>For: {r.creators?.name}</div>
                  <RatingStars rating={r.rating} />
                </div>
              </div>
              <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "var(--text2)", lineHeight: 1.7, fontFamily: "var(--font-body)", borderLeft: `3px solid ${r.status === "flagged" ? "var(--red)" : "var(--saffron)"}` }}>
                "{r.text}"
              </div>
              {(r.users?.connections_count < 50 || r.status === "flagged") && (
                <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#FCA5A5", fontFamily: "var(--font-body)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>⚠️ Suspicion signals:</span>
                  {r.users?.connections_count < 50 && <span>· Low connections ({r.users.connections_count})</span>}
                  {!r.users?.headline && <span>· No LinkedIn headline</span>}
                  {r.status === "flagged" && <span>· Community flagged</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-body)", alignSelf: "center" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                {actionLoading === r.id ? <div className="spinner" /> : (
                  <>
                    <button className="btn btn-approve" onClick={() => handleApprove(r.id)}>✓ Approve</button>
                    <button className="btn btn-reject" onClick={() => handleReject(r.id)}>✕ Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// STATS TAB
// ============================================
function StatsTab({ stats }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Platform Overview</div>
      <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginBottom: 24 }}>Real-time stats from Supabase</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="👨‍🏫" label="Approved Creators" value={stats?.approved_creators} color="#FF6B35" />
        <StatCard icon="⭐" label="Published Reviews" value={stats?.approved_reviews} color="#F59E0B" />
        <StatCard icon="👥" label="Total Users" value={stats?.total_users} color="#3B82F6" />
        <StatCard icon="🚩" label="Flagged Reviews" value={stats?.flagged_reviews} color="#EF4444" />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, marginBottom: 18 }}>System Health</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Backend API", status: "online", url: "ratemyguru-production.up.railway.app" },
            { label: "Supabase DB", status: "online", url: "supabase.com" },
            { label: "LinkedIn OAuth", status: "online", url: "linkedin.com/developers" },
            { label: "Frontend", status: "online", url: "ratemyguru.in" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface2)", borderRadius: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)" }}>{s.url}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} />
                <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-body)", fontWeight: 700 }}>online</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// DELETE /api/admin/creators/:id/delete
app.delete("/api/admin/creators/:id/delete", requireAdmin, async (req, res) => {
  try {
    // Delete reviews first
    await supabase.from("reviews").delete().eq("creator_id", req.params.id);
    // Then delete creator
    const { error } = await supabase.from("creators").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Creator deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LOGIN SCREEN
// ============================================
function LoginScreen({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch("/api/admin/stats");
      if (data.error) setError("Wrong admin key. Try again.");
      else { localStorage.setItem("rmg_admin_key", key); onLogin(); }
    } catch { setError("Cannot connect to backend. Is it running?"); }
    setLoading(false);
  };

  return (
    <div className="login-box">
      <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 20, padding: 40, width: "100%", maxWidth: 400, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
        <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #FF6B35, #FF9A6C)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(255,107,53,0.3)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Admin Panel</div>
        <div style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", marginBottom: 28 }}>RateMyGuru.in — Secure Access</div>
        <input type="password" value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter admin secret key"
          style={{ width: "100%", padding: "13px 16px", background: "var(--surface2)", border: "1.5px solid var(--border2)", borderRadius: 12, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
        {error && <div style={{ fontSize: 12, color: "var(--red)", fontFamily: "var(--font-body)", marginBottom: 12 }}>⚠️ {error}</div>}
        <button className="btn btn-approve" onClick={handleLogin} style={{ width: "100%", justifyContent: "center", padding: 13, fontSize: 14 }}>
          {loading ? <div className="spinner" /> : "🔐 Access Admin Panel"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN ADMIN APP
// ============================================
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, creatorsData, reviewsData] = await Promise.all([
        adminFetch("/api/admin/stats"),
        adminFetch("/api/admin/creators/pending"),
        adminFetch("/api/admin/reviews/pending"),
      ]);
      if (!statsData.error) setStats(statsData);
      if (Array.isArray(creatorsData)) setPendingCreators(creatorsData);
      if (Array.isArray(reviewsData)) setReviews(reviewsData);
    } catch (e) { /* keep existing data */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn, loadData]);

  const navItems = [
    { id: "stats", icon: "📊", label: "Overview" },
    { id: "creators", icon: "⏳", label: "Pending", count: pendingCreators.length },
    { id: "all_creators", icon: "👨‍🏫", label: "All Creators" },
    { id: "reviews", icon: "⭐", label: "Reviews", count: reviews.length },
  ];

  if (!isLoggedIn) return (
    <>
      <style>{styles}</style>
      <LoginScreen onLogin={() => setIsLoggedIn(true)} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ marginBottom: 28, paddingLeft: 4 }}><Logo /></div>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && (
                <span style={{ background: activeTab === item.id ? "rgba(255,107,53,0.3)" : "var(--surface2)", color: activeTab === item.id ? "var(--saffron)" : "var(--text3)", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20, fontFamily: "var(--font-body)" }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <button className="nav-item" onClick={() => { localStorage.removeItem("rmg_admin_key"); setIsLoggedIn(false); }} style={{ color: "var(--red)" }}>
              <span>🚪</span> Logout
            </button>
            <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)", padding: "8px 14px" }}>RateMyGuru Admin v1.0</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-body)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <button className="btn btn-view" onClick={loadData} style={{ fontSize: 12 }}>
              {loading ? <div className="spinner" /> : "↻ Refresh"}
            </button>
          </div>

          {activeTab === "stats" && <StatsTab stats={stats || MOCK_STATS} />}
          {activeTab === "creators" && <CreatorsTab creators={pendingCreators} setCreators={setPendingCreators} loading={loading} />}
          {activeTab === "all_creators" && <AllCreatorsTab />}
          {activeTab === "reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} loading={loading} />}
        </div>
      </div>
    </>
  );
}