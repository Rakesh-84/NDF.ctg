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

function Avatar({ url, name, size = 56 }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return url ? (
    <img
      src={url}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid rgba(0,106,78,0.18)",
        flexShrink: 0,
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #006A4E, #1A3A2A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: size * 0.33,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        border: "3px solid rgba(0,106,78,0.18)",
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon, delay = 0 }) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        animation: `fadeSlideUp 0.5s ease both`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(0,106,78,0.09)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: "800",
            fontSize: "24px",
            color: "#111111",
            lineHeight: 1,
          }}
        >
          {value ?? "—"}
        </div>
        <div style={{ fontSize: "12px", color: "#888888", fontWeight: "600", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label, description, delay = 0 }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        display: "block",
        animation: `fadeSlideUp 0.5s ease both`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="quick-link-card"
        style={{
          ...cardStyle,
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "11px",
            background: "linear-gradient(135deg, rgba(0,106,78,0.10), rgba(0,106,78,0.06))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "19px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: "600", fontSize: "14px", color: "#111111" }}>{label}</div>
          <div style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{description}</div>
        </div>
        <span style={{ color: "#CCCCCC", fontSize: "16px", flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}

export default function MemberDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ posts: null, events: null });
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) { navigate("/login"); return; }

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("users")
          .select("full_name, email, avatar_url, role, created_at, bio")
          .eq("id", user.id)
          .single();

        if (profileData?.role === "admin") {
          navigate("/admin/dashboard");
          return;
        }

        setProfile(profileData);

        // Parallel fetches
        const [postsRes, postsCountRes, eventsRes, participantRes] = await Promise.all([
          // Recent posts by this member
          supabase
           .from("posts")
           .select("id, title, status, created_at")
           .eq("author_id", user.id)
          .order("created_at", { ascending: false })
           .limit(3),

          // Total post count
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("author_id", user.id),

          // Upcoming events (public)
          supabase
            .from("events")
            .select("id, title, event_date, location")
            .gte("event_date", new Date().toISOString())
            .order("event_date", { ascending: true })
            .limit(3),

          // Events this member has joined
          supabase
            .from("event_participants")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setRecentPosts(postsRes.data || []);
        setUpcomingEvents(eventsRes.data || []);
        setStats({
          posts: postsCountRes.count ?? 0,
          events: participantRes.count ?? 0,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user, navigate]);

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  function memberSince(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  if (loading) {
    return (
      <>
        <style>{`${fonts} @keyframes bgBreathe { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
        <div style={{ ...bgStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#888888", fontSize: "14px" }}>Loading your dashboard…</div>
        </div>
      </>
    );
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
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .quick-link-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 28px rgba(180,140,80,0.18) !important;
        }
        .post-row:hover { background: rgba(0,106,78,0.03) !important; }
        .sign-out-btn:hover { background: rgba(212,32,39,0.07) !important; color: #D42027 !important; }
      `}</style>

      <div style={bgStyle}>
        {/* Header bar */}
        <div style={{ background: "#FFFDF9", borderBottom: "1px solid #EDE6D9", padding: "0 20px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/" style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "16px", color: "#006A4E", textDecoration: "none" }}>
              ← NDF BD.ctg
            </Link>
            <button
              className="sign-out-btn"
              onClick={signOut}
              style={{
                background: "transparent",
                border: "1px solid #E0D8CC",
                borderRadius: "8px",
                padding: "6px 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "600",
                fontSize: "13px",
                color: "#888888",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 16px" }}>

          {/* Profile hero card */}
          <div
            style={{
              ...cardStyle,
              padding: "28px 24px",
              marginBottom: "20px",
              animation: "fadeSlideUp 0.4s ease both",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative green arc */}
            <div style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(0,106,78,0.05)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(0,106,78,0.06)",
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <Avatar url={profile?.avatar_url} name={profile?.full_name || user?.email} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: "800",
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "0 0 4px",
                  background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                }}>
                  {profile?.full_name || "Welcome back"}
                </h1>
                <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#888888" }}>
                  {profile?.email || user?.email}
                </p>
                {profile?.created_at && (
                  <span style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#006A4E",
                    background: "rgba(0,106,78,0.08)",
                    padding: "2px 10px",
                    borderRadius: "20px",
                  }}>
                    Member since {memberSince(profile.created_at)}
                  </span>
                )}
              </div>
              <Link
                to="/member/profile"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#006A4E",
                  textDecoration: "none",
                  border: "1.5px solid #006A4E",
                  borderRadius: "9px",
                  padding: "7px 16px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                Edit Profile
              </Link>
            </div>

            {profile?.bio && (
              <p style={{
                margin: "16px 0 0",
                fontSize: "14px",
                color: "#555555",
                lineHeight: "1.6",
                paddingTop: "16px",
                borderTop: "1px solid rgba(180,140,80,0.12)",
              }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}>
            <StatCard label="Posts Written" value={stats.posts} icon="✍️" delay={0.05} />
            <StatCard label="Events Joined" value={stats.events} icon="🎤" delay={0.1} />
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: "20px", animation: "fadeSlideUp 0.5s ease 0.15s both" }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: "800",
              fontSize: "16px",
              color: "#111111",
              margin: "0 0 12px",
            }}>
              Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <QuickLink
                to="/member/write"
                icon="✍️"
                label="Write a Post"
                description="Share your thoughts with the community"
                delay={0.18}
              />
              <QuickLink
                to="/member/posts"
                icon="📄"
                label="My Posts"
                description="View and manage your articles"
                delay={0.22}
              />
              <QuickLink
                to="/events"
                icon="📅"
                label="Browse Events"
                description="See upcoming debates and workshops"
                delay={0.26}
              />
              <QuickLink
                to="/member/profile"
                icon="👤"
                label="Edit Profile"
                description="Update your info and avatar"
                delay={0.30}
              />
            </div>
          </div>

          {/* Recent posts */}
          <div
            style={{
              ...cardStyle,
              marginBottom: "20px",
              overflow: "hidden",
              animation: "fadeSlideUp 0.5s ease 0.32s both",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 20px 14px",
              borderBottom: "1px solid rgba(180,140,80,0.10)",
            }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "16px", margin: 0, color: "#111111" }}>
                My Recent Posts
              </h2>
              <Link to="/member/posts" style={{ fontSize: "13px", fontWeight: "600", color: "#006A4E", textDecoration: "none" }}>
                See all →
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>✍️</div>
                <p style={{ color: "#888888", margin: "0 0 14px", fontSize: "14px" }}>
                  You haven't written any posts yet.
                </p>
                <Link
                  to="/member/write"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #006A4E, #004D38)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "13px",
                    padding: "9px 20px",
                    borderRadius: "9px",
                    textDecoration: "none",
                  }}
                >
                  Write your first post
                </Link>
              </div>
            ) : (
              <div>
                {recentPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    to={`/member/posts`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="post-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 20px",
                        borderBottom: i < recentPosts.length - 1 ? "1px solid rgba(180,140,80,0.08)" : "none",
                        transition: "background 0.15s",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "9px",
                        background: post.published
                          ? "rgba(0,106,78,0.09)"
                          : "rgba(180,140,80,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        flexShrink: 0,
                      }}>
                        {post.published ? "✅" : "📝"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {post.title}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888888" }}>
                          {formatDate(post.created_at)} · {post.published ? "Published" : "Draft"}
                        </p>
                      </div>
                      <span style={{ color: "#CCCCCC", fontSize: "14px", flexShrink: 0 }}>›</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div
            style={{
              ...cardStyle,
              overflow: "hidden",
              animation: "fadeSlideUp 0.5s ease 0.38s both",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 20px 14px",
              borderBottom: "1px solid rgba(180,140,80,0.10)",
            }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "16px", margin: 0, color: "#111111" }}>
                Upcoming Events
              </h2>
              <Link to="/events" style={{ fontSize: "13px", fontWeight: "600", color: "#006A4E", textDecoration: "none" }}>
                See all →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📅</div>
                <p style={{ color: "#888888", margin: 0, fontSize: "14px" }}>No upcoming events right now.</p>
              </div>
            ) : (
              <div>
                {upcomingEvents.map((ev, i) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="post-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 20px",
                        borderBottom: i < upcomingEvents.length - 1 ? "1px solid rgba(180,140,80,0.08)" : "none",
                        transition: "background 0.15s",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(0,106,78,0.07)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#006A4E", lineHeight: 1 }}>
                          {new Date(ev.event_date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
                        </span>
                        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "16px", color: "#006A4E", lineHeight: 1 }}>
                          {new Date(ev.event_date).getDate()}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.title}
                        </p>
                        {ev.location && (
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888888" }}>
                            📍 {ev.location}
                          </p>
                        )}
                      </div>
                      <span style={{ color: "#CCCCCC", fontSize: "14px", flexShrink: 0 }}>›</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}