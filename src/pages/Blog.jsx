import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ── tiny helpers ──────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const CATEGORIES = ["All", "Debate", "Tournament", "Opinion", "News", "Guide"];

// ── component ─────────────────────────────────────────────────
export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");



useEffect(() => {
  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `id, title, slug, excerpt, cover_image_url, category, published_at,
         users:author_id (full_name, avatar_url)`
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  }

  fetchPosts();
}, []);

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* ── breathing bg ───────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;1,800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .blog-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 100px;
        }
        .fraunces { font-family: 'Fraunces', serif; }

        /* card */
        .post-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 16px;
          overflow: hidden;
          transition: transform .22s ease, box-shadow .22s ease;
          animation: fadeUp .4s ease both;
        }
        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(180,140,80,0.18);
        }

        /* featured */
        .featured-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeUp .5s ease both;
          transition: box-shadow .22s;
        }
        .featured-card:hover { box-shadow: 0 16px 48px rgba(180,140,80,0.20); }

        /* skeleton */
        .skeleton {
          background: linear-gradient(90deg,#f0ebe3 25%,#faf6f0 50%,#f0ebe3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }

        /* search */
        .search-box {
          background: #FFFDF9;
          border: 1.5px solid rgba(180,140,80,0.20);
          border-radius: 12px;
          padding: 10px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          transition: border-color .2s;
          width: 100%;
          max-width: 360px;
        }
        .search-box:focus { border-color: #006A4E; }

        /* category pills */
        .cat-pill {
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all .18s;
          white-space: nowrap;
        }
        .cat-pill.active {
          background: #006A4E;
          color: #fff;
          border-color: #006A4E;
        }
        .cat-pill.inactive {
          background: #FFFDF9;
          color: #555;
          border-color: rgba(180,140,80,0.20);
        }
        .cat-pill.inactive:hover {
          border-color: #006A4E;
          color: #006A4E;
        }

        /* cover img */
        .cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,#EEF5F1,#F0F7F4);
          font-size: 42px;
        }

        /* category badge */
        .cat-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .03em;
          text-transform: uppercase;
          background: rgba(0,106,78,0.10);
          color: #006A4E;
        }

        .read-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #006A4E;
          color: #fff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background .18s, transform .18s;
        }
        .read-btn:hover { background: #004D38; transform: translateX(2px); }

        .arrow-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #006A4E;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: gap .18s;
        }
        .arrow-link:hover { gap: 8px; }
      `}</style>

      <div className="blog-root">
        {/* ── top nav spacer (existing navbar handles it) ── */}
        <div style={{ height: 20 }} />

        {/* ── page header ─────────────────────────────── */}
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#006A4E", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
              Community Blog
            </p>
            <h1
              className="fraunces"
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                background: "linear-gradient(135deg,#006A4E 0%,#1A3A2A 60%,#004D38 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.15,
                marginBottom: 14,
              }}
            >
              Insights & Stories
            </h1>
            <p style={{ color: "#555", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
              Thoughts, guides, and updates from the Chittagong debate community.
            </p>
          </div>

          {/* ── search + filters ──────────────────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 32 }}>
            <div style={{ position: "relative", flexGrow: 1, maxWidth: 360 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 16 }}>🔍</span>
              <input
                className="search-box"
                style={{ paddingLeft: 36 }}
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`cat-pill ${category === c ? "active" : "inactive"}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ── loading skeletons ─────────────────────── */}
          {loading && (
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#FFFDF9", border: "1px solid rgba(255,255,255,.95)", boxShadow: "0 4px 20px rgba(180,140,80,.10)" }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 22, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 14, width: "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── empty state ───────────────────────────── */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <p style={{ fontSize: 18, fontWeight: 500, color: "#555" }}>No posts found</p>
              <p style={{ fontSize: 14, marginTop: 6 }}>Try a different search or category.</p>
            </div>
          )}

          {/* ── featured post ─────────────────────────── */}
          {!loading && featured && (
            <Link to={`/blog/${featured.slug || featured.id}`} style={{ textDecoration: "none" }}>
              <div className="featured-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 40 }}>
                {/* cover */}
                <div style={{ height: 340, position: "relative" }}>
                  {featured.cover_image_url ? (
                    <img className="cover-img" src={featured.cover_image_url} alt={featured.title} />
                  ) : (
                    <div className="cover-placeholder">📰</div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 50%,#FFFDF9)" }} />
                </div>
                {/* content */}
                <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="cat-badge">{featured.category || "Blog"}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>Featured</span>
                  </div>
                  <h2
                    className="fraunces"
                    style={{ fontSize: "clamp(22px,3vw,30px)", color: "#111", lineHeight: 1.25, margin: 0 }}
                  >
                    {featured.title}
                  </h2>
                  <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                    {featured.excerpt?.slice(0, 160)}…
                  </p>
                  {/* author */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                    {featured.users?.avatar_url ? (
                      <img src={featured.users.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#006A4E", fontWeight: 700 }}>
                        {featured.users?.full_name?.[0] || "A"}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{featured.users?.full_name || "Author"}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{fmt(featured.published_at)}</p>
                    </div>
                  </div>
                  <div>
                    <span className="read-btn">Read Article →</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ── grid ──────────────────────────────────── */}
          {!loading && rest.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 24,
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              }}
            >
              {rest.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="post-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    {/* cover */}
                    <div style={{ height: 200 }}>
                      {post.cover_image_url ? (
                        <img className="cover-img" src={post.cover_image_url} alt={post.title} />
                      ) : (
                        <div className="cover-placeholder">📄</div>
                      )}
                    </div>
                    {/* body */}
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span className="cat-badge">{post.category || "Blog"}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{fmt(post.published_at)}</span>
                      </div>
                      <h3
                        className="fraunces"
                        style={{ fontSize: 18, color: "#111", lineHeight: 1.3, margin: "0 0 8px" }}
                      >
                        {post.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 16px" }}>
                        {post.excerpt?.slice(0, 110)}…
                      </p>
                      {/* author row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {post.users?.avatar_url ? (
                            <img src={post.users.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#006A4E", fontWeight: 700 }}>
                              {post.users?.full_name?.[0] || "A"}
                            </div>
                          )}
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>{post.users?.full_name || "Author"}</span>
                        </div>
                        <span className="arrow-link">Read →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}