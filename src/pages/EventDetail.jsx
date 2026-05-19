import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/* ─── helpers ─────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

/* ─── Meta Pill ───────────────────────────────────────────── */
function MetaPill({ icon, label, value, accent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        background: "#FFFDF9",
        borderRadius: "12px",
        border: "1px solid rgba(180,140,80,0.13)",
        boxShadow: "0 2px 8px rgba(180,140,80,0.07)",
        padding: "0.9rem 1.1rem",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "9px",
          background: accent
            ? "rgba(212,32,39,0.08)"
            : "rgba(0,106,78,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.2rem",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "#111111",
            lineHeight: 1.3,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─── Participant Row ─────────────────────────────────────── */
function ParticipantRow({ participant, index }) {
  const initials = participant.full_name
    ? participant.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const colors = [
    ["#006A4E", "rgba(0,106,78,0.10)"],
    ["#1A3A2A", "rgba(26,58,42,0.10)"],
    ["#D42027", "rgba(212,32,39,0.10)"],
    ["#B8860B", "rgba(184,134,11,0.10)"],
  ];
  const [fg, bg] = colors[index % colors.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        transition: "background 0.18s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,106,78,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Avatar */}
      {participant.avatar_url ? (
        <img
          src={participant.avatar_url}
          alt={participant.full_name}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            border: "2px solid rgba(180,140,80,0.15)",
          }}
        />
      ) : (
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: bg,
            color: fg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            fontSize: "0.85rem",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}

      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.88rem",
            color: "#111111",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {participant.full_name || "Member"}
        </div>
        {participant.role_in_event && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.73rem",
              color: "#888888",
              marginTop: "0.05rem",
            }}
          >
            {participant.role_in_event}
          </div>
        )}
      </div>

      {/* Result badge */}
      {participant.result && (
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.18rem 0.6rem",
            borderRadius: "999px",
            background:
              participant.result.toLowerCase().includes("win")
                ? "rgba(0,106,78,0.10)"
                : participant.result.toLowerCase().includes("loss")
                ? "rgba(212,32,39,0.08)"
                : "rgba(180,140,80,0.10)",
            color:
              participant.result.toLowerCase().includes("win")
                ? "#006A4E"
                : participant.result.toLowerCase().includes("loss")
                ? "#D42027"
                : "#888888",
            textTransform: "capitalize",
          }}
        >
          {participant.result}
        </span>
      )}
    </div>
  );
}

/* ─── Photo Lightbox ──────────────────────────────────────── */
function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % photos.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          background: "rgba(255,255,255,0.12)",
          border: "none",
          color: "#fff",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length); }}
          style={{
            position: "absolute",
            left: "1rem",
            background: "rgba(255,255,255,0.12)",
            border: "none",
            color: "#fff",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={photos[current].photo_url}
        alt={photos[current].caption || "Event photo"}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          borderRadius: "12px",
          objectFit: "contain",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      />

      {/* Caption + counter */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "rgba(255,255,255,0.75)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.82rem",
        }}
      >
        {photos[current].caption && (
          <div style={{ marginBottom: "0.25rem" }}>{photos[current].caption}</div>
        )}
        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
          {current + 1} / {photos.length}
        </div>
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length); }}
          style={{
            position: "absolute",
            right: "1rem",
            background: "rgba(255,255,255,0.12)",
            border: "none",
            color: "#fff",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENT DETAIL PAGE
═══════════════════════════════════════════════════════════ */
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState(null); // index or null
  const [joining, setJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Event
        const { data: ev, error: evErr } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (evErr || !ev) { setNotFound(true); setLoading(false); return; }
        setEvent(ev);

        // Participants — join with users for name + avatar
        const { data: parts } = await supabase
          .from("event_participants")
          .select("id, role_in_event, result, user_id, users(full_name, avatar_url)")
          .eq("event_id", id);

        const flat = (parts || []).map((p) => ({
          id: p.id,
          user_id: p.user_id,
          role_in_event: p.role_in_event,
          result: p.result,
          full_name: p.users?.full_name,
          avatar_url: p.users?.avatar_url,
        }));
        setParticipants(flat);

        // Check if current user is already a participant
        if (user) {
          setIsParticipant(flat.some((p) => p.user_id === user.id));
        }

        // Photos
        const { data: imgs } = await supabase
          .from("event_photos")
          .select("id, photo_url, caption, display_order")
          .eq("event_id", id)
          .order("display_order", { ascending: true });

        setPhotos(imgs || []);
      } catch (err) {
        console.error("EventDetail fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id, user]);

  /* Join event */
  async function handleJoin() {
    if (!user) { navigate("/login"); return; }
    setJoining(true);
    try {
      const { error } = await supabase
        .from("event_participants")
        .insert({ event_id: id, user_id: user.id });
      if (!error) setIsParticipant(true);
    } catch (err) {
      console.error("Join error:", err);
    } finally {
      setJoining(false);
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.25rem" }}>
          <div style={{ height: "14px", width: "120px", borderRadius: "6px", background: "rgba(180,140,80,0.12)", marginBottom: "2rem", animation: "pulse 1.6s infinite" }} />
          <div style={{ height: "44px", width: "70%", borderRadius: "8px", background: "rgba(180,140,80,0.10)", marginBottom: "1rem", animation: "pulse 1.6s infinite" }} />
          <div style={{ height: "18px", width: "50%", borderRadius: "6px", background: "rgba(180,140,80,0.08)", animation: "pulse 1.6s infinite" }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
        </div>
      </>
    );
  }

  /* ── Not found ── */
  if (notFound) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 1.25rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "2rem", color: "#111111", marginBottom: "0.75rem" }}>Event not found</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#888888", marginBottom: "2rem" }}>This event may have been removed or the link is incorrect.</p>
          <Link to="/events" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#fff", textDecoration: "none", padding: "0.75rem 1.75rem", borderRadius: "10px", background: "linear-gradient(135deg,#006A4E,#004D38)" }}>
            Back to Events
          </Link>
        </div>
      </>
    );
  }

  const past = isPast(event.event_date);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:.3} }
        .photo-thumb:hover { transform: scale(1.03); }
      `}</style>

      {lightbox !== null && (
        <Lightbox photos={photos} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.25rem 7rem", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#888888", marginBottom: "1.75rem" }}>
          <Link to="/" style={{ color: "#888888", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link to="/events" style={{ color: "#888888", textDecoration: "none" }}>Events</Link>
          <span>/</span>
          <span style={{ color: "#111111", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
            {event.title}
          </span>
        </div>

        {/* ── Hero block ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          {/* Status + type row */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
            {past ? (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888888", background: "rgba(136,136,136,0.10)", padding: "0.2rem 0.7rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Past Event
              </span>
            ) : (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#006A4E", background: "rgba(0,106,78,0.10)", padding: "0.2rem 0.7rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#006A4E", display: "inline-block", animation: "blink 1.8s infinite" }} />
                Upcoming
              </span>
            )}
            {event.event_type && (
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#D42027", background: "rgba(212,32,39,0.08)", padding: "0.2rem 0.7rem", borderRadius: "999px" }}>
                {event.event_type}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              color: "#111111",
              margin: "0 0 1rem",
              lineHeight: 1.15,
            }}
          >
            {event.title}
          </h1>

          {/* Join button — only for upcoming + logged-in members */}
          {!past && (
            <div style={{ marginBottom: "1.5rem" }}>
              {isParticipant ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#006A4E", background: "rgba(0,106,78,0.08)", padding: "0.6rem 1.2rem", borderRadius: "10px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006A4E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  You're registered
                </span>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#fff",
                    background: joining ? "rgba(0,106,78,0.6)" : "linear-gradient(135deg,#006A4E,#004D38)",
                    border: "none",
                    padding: "0.7rem 1.75rem",
                    borderRadius: "10px",
                    cursor: joining ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(0,106,78,0.28)",
                    transition: "transform 0.18s",
                  }}
                  onMouseEnter={(e) => !joining && (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {joining ? "Registering…" : user ? "Register for this Event" : "Log in to Register"}
                </button>
              )}
            </div>
          )}

          {/* Meta pills grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <MetaPill
              label="Date"
              value={formatDate(event.event_date)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006A4E" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
            />
            <MetaPill
              label="Time"
              value={formatTime(event.event_date)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006A4E" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              }
            />
            {event.location && (
              <MetaPill
                label="Location"
                value={event.location}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006A4E" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                }
              />
            )}
            <MetaPill
              label="Participants"
              value={`${participants.length} registered`}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006A4E" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: "rgba(180,140,80,0.14)", marginBottom: "2.5rem" }} />

        {/* ── Description ── */}
        {event.description && (
          <section style={{ marginBottom: "2.75rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "1.25rem", color: "#111111", margin: "0 0 1rem" }}>
              About this Event
            </h2>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.93rem",
                color: "#444444",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {event.description}
            </div>
          </section>
        )}

        {/* ── Photo Gallery ── */}
        {photos.length > 0 && (
          <section style={{ marginBottom: "2.75rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "1.25rem", color: "#111111", margin: "0 0 1rem" }}>
              Photo Gallery
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", color: "#888888", marginLeft: "0.6rem" }}>
                {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "0.6rem",
              }}
            >
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="photo-thumb"
                  onClick={() => setLightbox(i)}
                  style={{
                    aspectRatio: "4/3",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.22s ease",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
                  }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || `Photo ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#888888", marginTop: "0.6rem" }}>
              Click any photo to view fullscreen · Arrow keys to navigate
            </p>
          </section>
        )}

        {/* ── Participants ── */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "1.25rem", color: "#111111", margin: 0 }}>
              Participants
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", color: "#888888", marginLeft: "0.6rem" }}>
                {participants.length}
              </span>
            </h2>
          </div>

          {participants.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                background: "#FFFDF9",
                borderRadius: "16px",
                border: "1px solid rgba(180,140,80,0.12)",
              }}
            >
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#888888", fontSize: "0.88rem", margin: 0 }}>
                {past ? "No participant records for this event." : "No one has registered yet. Be the first!"}
              </p>
            </div>
          ) : (
            <div
              style={{
                background: "#FFFDF9",
                borderRadius: "16px",
                border: "1px solid rgba(180,140,80,0.12)",
                boxShadow: "0 2px 12px rgba(180,140,80,0.07)",
                overflow: "hidden",
              }}
            >
              {participants.map((p, i) => (
                <div key={p.id}>
                  <ParticipantRow participant={p} index={i} />
                  {i < participants.length - 1 && (
                    <div style={{ height: "1px", background: "rgba(180,140,80,0.08)", margin: "0 1rem" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Back link */}
        <div style={{ marginTop: "3rem" }}>
          <Link
            to="/events"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "#555555",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            ← Back to all events
          </Link>
        </div>
      </div>
    </>
  );
}