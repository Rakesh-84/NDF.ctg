import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const gradientBg = {
  background:
    "linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)",
  backgroundSize: "300% 300%",
  animation: "bgBreathe 14s ease infinite",
  minHeight: "100vh",
};

const cardStyle = {
  background: "#FFFDF9",
  boxShadow: "0 4px 20px rgba(180,140,80,0.10)",
  border: "1px solid rgba(255,255,255,0.95)",
  borderRadius: "16px",
  padding: "20px 24px",
  marginBottom: "14px",
};

const tabStyle = (active) => ({
  padding: "8px 20px",
  borderRadius: "20px",
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 600,
  fontSize: "13px",
  cursor: "pointer",
  background: active
    ? "linear-gradient(135deg, #006A4E, #004D38)"
    : "transparent",
  color: active ? "white" : "#555555",
  border: active ? "none" : "1px solid #E5DDD0",
  transition: "all 0.2s ease",
});

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"];

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPosts();
 }, [filter]);

  async function fetchPosts() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("posts")
        .select("*, users(full_name, email)")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  } 

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function updateStatus(id, status) {
    setActionLoading(id + status);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      showSuccess(`Post ${status}.`);
      fetchPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this post?")) return;
    setActionLoading(id + "delete");
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      showSuccess("Post deleted.");
      fetchPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function statusBadge(status) {
    const map = {
      pending: { bg: "#FFF8E6", color: "#B8860B", label: "Pending" },
      approved: { bg: "#F0FBF6", color: "#006A4E", label: "Approved" },
      rejected: { bg: "#FFF0F0", color: "#D42027", label: "Rejected" },
    };
    const s = map[status] || { bg: "#F5F5F5", color: "#888888", label: status };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          fontFamily: "DM Sans, sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: "20px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {s.label}
      </span>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div style={gradientBg}>
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "40px 20px 100px",
          }}
        >
          {/* Header */}
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 36px)",
              background:
                "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 8px 0",
            }}
          >
            Manage Posts
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              color: "#555555",
              fontSize: "14px",
              margin: "0 0 28px 0",
            }}
          >
            Review, approve, reject, or delete member blog posts.
          </p>

          {/* Alerts */}
          {error && (
            <div
              style={{
                background: "#FFF0F0",
                border: "1px solid #D42027",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                color: "#D42027",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                background: "#F0FBF6",
                border: "1px solid #006A4E",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                color: "#006A4E",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
              }}
            >
              ✓ {success}
            </div>
          )}

          {/* Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                style={tabStyle(filter === f)}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: "#888888",
                textAlign: "center",
                padding: "60px 0",
              }}
            >
              Loading posts...
            </p>
          )}

          {/* Empty */}
          {!loading && posts.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", padding: "50px" }}>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  color: "#888888",
                  margin: 0,
                }}
              >
                No {filter === "all" ? "" : filter} posts found.
              </p>
            </div>
          )}

          {/* Posts */}
          {!loading &&
            posts.map((post) => (
              <div key={post.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Post Info */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "Fraunces, serif",
                          fontWeight: 800,
                          fontSize: "16px",
                          color: "#111111",
                          margin: 0,
                        }}
                      >
                        {post.title}
                      </h3>
                      {statusBadge(post.status)}
                    </div>

                    {post.excerpt && (
                      <p
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          color: "#555555",
                          fontSize: "13px",
                          margin: "0 0 8px 0",
                          lineHeight: "1.5",
                        }}
                      >
                        {post.excerpt.length > 100
                          ? post.excerpt.slice(0, 100) + "..."
                          : post.excerpt}
                      </p>
                    )}

                    <div
                      style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
                    >
                      <span
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          color: "#888888",
                          fontSize: "12px",
                        }}
                      >
                        ✍️{" "}
                        {post.users?.full_name ||
                          post.users?.email ||
                          "Unknown"}
                      </span>
                      <span
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          color: "#888888",
                          fontSize: "12px",
                        }}
                      >
                        🗓{" "}
                        {new Date(post.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {post.status !== "approved" && (
                      <button
                        style={{
                          background:
                            "linear-gradient(135deg, #006A4E, #004D38)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontFamily: "DM Sans, sans-serif",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity:
                            actionLoading === post.id + "approved" ? 0.6 : 1,
                        }}
                        onClick={() => updateStatus(post.id, "approved")}
                        disabled={!!actionLoading}
                      >
                        Approve
                      </button>
                    )}

                    {post.status !== "rejected" && (
                      <button
                        style={{
                          background: "transparent",
                          color: "#B8860B",
                          border: "1px solid #B8860B",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontFamily: "DM Sans, sans-serif",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity:
                            actionLoading === post.id + "rejected" ? 0.6 : 1,
                        }}
                        onClick={() => updateStatus(post.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        Reject
                      </button>
                    )}

                    <button
                      style={{
                        background: "transparent",
                        color: "#D42027",
                        border: "1px solid #D42027",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontFamily: "DM Sans, sans-serif",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading === post.id + "delete" ? 0.6 : 1,
                      }}
                      onClick={() => handleDelete(post.id)}
                      disabled={!!actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
