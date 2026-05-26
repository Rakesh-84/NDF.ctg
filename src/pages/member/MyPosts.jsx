import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;1,400&family=DM+Sans:wght@400;500;600&display=swap');
`;

const bgStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)",
  backgroundSize: "300% 300%",
  animation: "bgBreathe 14s ease infinite",
  fontFamily: "'DM Sans', sans-serif",
  color: "#111111",
  paddingBottom: "80px",
};

const cardStyle = {
  background: "#FFFDF9",
  boxShadow: "0 4px 20px rgba(180,140,80,0.10)",
  border: "1px solid rgba(255,255,255,0.95)",
  borderRadius: "16px",
};

const dangerBtn = {
  background: "transparent",
  color: "#D42027",
  border: "1px solid #D42027",
  borderRadius: "8px",
  padding: "5px 12px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
  transition: "background 0.15s",
  whiteSpace: "nowrap",
};

const editBtn = {
  background: "transparent",
  color: "#006A4E",
  border: "1px solid #006A4E",
  borderRadius: "8px",
  padding: "5px 12px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
  transition: "background 0.15s",
  whiteSpace: "nowrap",
};

const STATUS_FILTERS = ["all", "published", "draft"];

export default function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [filter, setFilter] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      if (!user) { navigate("/login"); return; }

      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, status, created_at, updated_at, cover_image_path")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (!fetchError) setPosts(data || []);
      setLoading(false);
    }
    fetchPosts();
  }, [user, navigate]);

  const filtered = filter === "all"
    ? posts
    : posts.filter((p) => p.status === filter);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  async function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post.id);

    // Delete cover image from storage if exists
    if (post.cover_image_path) {
      await supabase.storage.from("post-covers").remove([post.cover_image_path]);
    }

    const { error: delError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (!delError) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setSuccess("Post deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(delError.message);
    }
    setDeleting(null);
  }

  async function handleToggleStatus(post) {
    const newStatus = post.status === "published" ? "draft" : "published";
    setToggling(post.id);

    const { error: toggleError } = await supabase
      .from("posts")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (!toggleError) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: newStatus } : p
        )
      );
      setSuccess(newStatus === "published" ? "Post published!" : "Post moved to drafts.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(toggleError.message);
    }
    setToggling(null);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <>
      <style>{`
        ${fonts}
        @keyframes bgBreathe {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .post-card { transition: box-shadow 0.2s; }
        .post-card:hover { box-shadow: 0 8px 28px rgba(180,140,80,0.18) !important; }
        .danger-btn:hover { background: rgba(212,32,39,0.07) !important; }
        .edit-btn:hover { background: rgba(0,106,78,0.07) !important; }
        .filter-chip { cursor: pointer; transition: all 0.15s; }
        .toggle-btn { transition: all 0.2s; }
        .toggle-btn:hover { opacity: 0.8; }
      `}</style>

      <div style={bgStyle}>
        {/* Header */}
        <div style={{ background: "#FFFDF9", borderBottom: "1px solid #EDE6D9", padding: "0 20px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => navigate("/member/dashboard")}
              style={{ background: "none", border: "none", color: "#006A4E", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}
            >
              ← Dashboard
            </button>
            <Link
              to="/member/write"
              style={{
                background: "linear-gradient(135deg, #006A4E, #004D38)",
                color: "#fff",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "600",
                fontSize: "13px",
                padding: "7px 16px",
                borderRadius: "9px",
              }}
            >
              + New Post
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 16px" }}>

          {/* Page title + counts */}
          <div style={{ marginBottom: "20px", animation: "fadeSlideUp 0.4s ease both" }}>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: "800",
              fontSize: "26px",
              margin: "0 0 6px",
              background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              My Posts
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#888888" }}>
              {posts.length} total · {publishedCount} published · {draftCount} draft{draftCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Banners */}
          {success && (
            <div style={{ background: "rgba(0,106,78,0.09)", border: "1px solid rgba(0,106,78,0.25)", borderRadius: "10px", padding: "11px 16px", marginBottom: "16px", color: "#006A4E", fontWeight: "600", fontSize: "13px", animation: "fadeSlideUp 0.3s ease" }}>
              ✓ {success}
            </div>
          )}
          {error && (
            <div style={{ background: "rgba(212,32,39,0.08)", border: "1px solid rgba(212,32,39,0.25)", borderRadius: "10px", padding: "11px 16px", marginBottom: "16px", color: "#D42027", fontWeight: "600", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* Filter chips */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className="filter-chip"
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "24px",
                  border: "1px solid",
                  borderColor: filter === f ? "#006A4E" : "#E0D8CC",
                  background: filter === f ? "rgba(0,106,78,0.09)" : "#FFFDF9",
                  color: filter === f ? "#006A4E" : "#555555",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                {f === "all" ? `All (${posts.length})` : f === "published" ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#888888", fontSize: "14px" }}>
              Loading your posts…
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div style={{ ...cardStyle, padding: "56px 24px", textAlign: "center", animation: "fadeSlideUp 0.4s ease both" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>✍️</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "18px", margin: "0 0 8px", color: "#111111" }}>
                {filter === "all" ? "No posts yet" : `No ${filter} posts`}
              </h3>
              <p style={{ color: "#888888", margin: "0 0 20px", fontSize: "14px" }}>
                {filter === "all" ? "Start writing and share your ideas with the community." : `You have no ${filter} posts right now.`}
              </p>
              {filter === "all" && (
                <Link
                  to="/member/write"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #006A4E, #004D38)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    textDecoration: "none",
                  }}
                >
                  Write your first post
                </Link>
              )}
            </div>
          ) : (
            /* Posts list */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((post, i) => (
                <div
                  key={post.id}
                  className="post-card"
                  style={{
                    ...cardStyle,
                    padding: "18px 20px",
                    animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both`,
                    borderLeft: post.status === "published"
                      ? "3px solid #006A4E"
                      : "3px solid #E0D8CC",
                  }}
                >
                  {/* Top row: title + status badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                        <h3 style={{
                          fontFamily: "'Fraunces', serif",
                          fontWeight: "800",
                          fontSize: "15px",
                          margin: 0,
                          color: "#111111",
                          wordBreak: "break-word",
                          lineHeight: 1.3,
                        }}>
                          {post.title}
                        </h3>
                        <span style={{
                          flexShrink: 0,
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 9px",
                          borderRadius: "20px",
                          background: post.status === "published"
                            ? "rgba(0,106,78,0.09)"
                            : "rgba(180,140,80,0.12)",
                          color: post.status === "published" ? "#006A4E" : "#888888",
                        }}>
                          {post.status === "published" ? "✓ Published" : "Draft"}
                        </span>
                      </div>

                      {post.excerpt && (
                        <p style={{
                          margin: "0 0 6px",
                          fontSize: "13px",
                          color: "#888888",
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {post.excerpt}
                        </p>
                      )}

                      <p style={{ margin: 0, fontSize: "11px", color: "#AAAAAA" }}>
                        Created {formatDate(post.created_at)}
                        {post.updated_at && post.updated_at !== post.created_at && (
                          <span> · Updated {formatDate(post.updated_at)}</span>
                        )}
                        {post.slug && (
                          <span style={{ color: "#CCCCCC" }}> · /{post.slug}</span>
                        )}
                      </p>
                    </div>

                    {/* Cover image thumbnail */}
                    {post.cover_image_path && (
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#F0EBE3",
                      }}>
                        <img
                          src={supabase.storage.from("post-covers").getPublicUrl(post.cover_image_path).data.publicUrl}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.parentElement.style.display = "none"; }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(180,140,80,0.08)" }}>
                    {/* Publish / Unpublish toggle */}
                    <button
                      className="toggle-btn"
                      onClick={() => handleToggleStatus(post)}
                      disabled={toggling === post.id}
                      style={{
                        background: post.status === "published"
                          ? "rgba(180,140,80,0.10)"
                          : "rgba(0,106,78,0.09)",
                        color: post.status === "published" ? "#888888" : "#006A4E",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 13px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: toggling === post.id ? "not-allowed" : "pointer",
                        opacity: toggling === post.id ? 0.6 : 1,
                      }}
                    >
                      {toggling === post.id
                        ? "Saving…"
                        : post.status === "published"
                        ? "↓ Unpublish"
                        : "↑ Publish"}
                    </button>

                    <Link
                      to={`/member/write?edit=${post.id}`}
                      className="edit-btn"
                      style={{ ...editBtn, textDecoration: "none", display: "inline-block" }}
                    >
                      Edit
                    </Link>

                    {post.status === "published" && (
                      <Link
                        to={`/blog/${post.id}`}
                        target="_blank"
                        style={{
                          color: "#555555",
                          border: "1px solid #E0D8CC",
                          borderRadius: "8px",
                          padding: "5px 12px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: "600",
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View ↗
                      </Link>
                    )}

                    <button
                      className="danger-btn"
                      style={{ ...dangerBtn, marginLeft: "auto", opacity: deleting === post.id ? 0.6 : 1 }}
                      onClick={() => handleDelete(post)}
                      disabled={deleting === post.id}
                    >
                      {deleting === post.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}