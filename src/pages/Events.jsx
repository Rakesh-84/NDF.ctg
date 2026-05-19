import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* ─── helpers ─────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
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

/* ─── Event Card ──────────────────────────────────────────── */
function EventCard({ event }) {
  const past = isPast(event.event_date);

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FFFDF9",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 20px rgba(180,140,80,0.10), 0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          opacity: past ? 0.72 : 1,
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 10px 32px rgba(180,140,80,0.18), 0 2px 8px rgba(0,0,0,0.07)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(180,140,80,0.10), 0 1px 4px rgba(0,0,0,0.05)";
        }}
      >
        {/* Top color band */}
        <div
          style={{
            height: "5px",
            background: past
              ? "linear-gradient(90deg, #aaa, #ccc)"
              : "linear-gradient(90deg, #006A4E, #1A3A2A)",
          }}
        />

        <div style={{ padding: "1.35rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
            {/* Date chip */}
            <div
              style={{
                background: past ? "rgba(136,136,136,0.08)" : "rgba(0,106,78,0.08)",
                color: past ? "#888888" : "#006A4E",
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(event.event_date)}
            </div>

            {/* Status badge */}
            {past ? (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#888888",
                  background: "rgba(136,136,136,0.10)",
                  padding: "0.18rem 0.55rem",
                  borderRadius: "999px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Past
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#006A4E",
                  background: "rgba(0,106,78,0.10)",
                  padding: "0.18rem 0.55rem",
                  borderRadius: "999px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#006A4E",
                    display: "inline-block",
                    animation: "blink 1.8s ease-in-out infinite",
                  }}
                />
                Upcoming
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: "1.08rem",
              color: "#111111",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.84rem",
                color: "#555555",
                margin: 0,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {event.description}
            </p>
          )}

          {/* Footer meta */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "0.5rem",
              borderTop: "1px solid rgba(180,140,80,0.10)",
            }}
          >
            {event.location && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.77rem",
                  color: "#888888",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {event.location}
              </span>
            )}
            {event.event_date && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.77rem",
                  color: "#888888",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(event.event_date)}
              </span>
            )}
            {event.event_type && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#D42027",
                  background: "rgba(212,32,39,0.07)",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "999px",
                  marginLeft: "auto",
                }}
              >
                {event.event_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton Card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#FFFDF9",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: "0 4px 20px rgba(180,140,80,0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "5px", background: "rgba(180,140,80,0.12)" }} />
      <div style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[40, 80, 60, 90, 50].map((w, i) => (
          <div
            key={i}
            style={{
              height: i === 1 ? "22px" : "14px",
              width: `${w}%`,
              borderRadius: "6px",
              background: "rgba(180,140,80,0.10)",
              animation: "pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */
function EmptyState({ filtered }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "4rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "rgba(0,106,78,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,106,78,0.4)" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div>
        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#111111",
            margin: "0 0 0.35rem",
          }}
        >
          {filtered ? "No events match your filters" : "No events yet"}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            color: "#888888",
            margin: 0,
          }}
        >
          {filtered ? "Try adjusting your search or filters." : "Check back soon for upcoming debates and workshops."}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENTS PAGE
═══════════════════════════════════════════════════════════ */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming"); // "upcoming" | "past" | "all"
  const [typeFilter, setTypeFilter] = useState("all");
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, description, event_date, location, event_type")
          .order("event_date", { ascending: false });

        if (error) throw error;
        setEvents(data || []);

        // Extract unique event types for filter
        const types = [...new Set((data || []).map((e) => e.event_type).filter(Boolean))];
        setEventTypes(types);
      } catch (err) {
        console.error("Events fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  /* filtered list */
  const filtered = useMemo(() => {
    let list = [...events];

    // Tab filter
    if (tab === "upcoming") list = list.filter((e) => !isPast(e.event_date));
    else if (tab === "past") list = list.filter((e) => isPast(e.event_date));

    // Type filter
    if (typeFilter !== "all") list = list.filter((e) => e.event_type === typeFilter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }

    // Sort: upcoming → ascending date, past → descending
    if (tab === "upcoming") list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    else list.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    return list;
  }, [events, tab, typeFilter, search]);

  /* counts */
  const upcomingCount = events.filter((e) => !isPast(e.event_date)).length;
  const pastCount = events.filter((e) => isPast(e.event_date)).length;

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "past", label: "Past", count: pastCount },
    { key: "all", label: "All", count: events.length },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .search-input:focus {
          outline: none;
          border-color: rgba(0,106,78,0.45) !important;
          box-shadow: 0 0 0 3px rgba(0,106,78,0.08) !important;
        }
        .type-chip:hover {
          background: rgba(0,106,78,0.10) !important;
          color: #006A4E !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          paddingBottom: "6rem",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "3rem 1.25rem 0",
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.78rem",
              color: "#888888",
              marginBottom: "1.5rem",
            }}
          >
            <Link to="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: "#111111", fontWeight: 600 }}>Events</span>
          </div>

          {/* Title block */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#111111",
                margin: "0 0 0.65rem",
                lineHeight: 1.1,
              }}
            >
              Events &{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Debates
              </span>
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#555555",
                margin: 0,
                maxWidth: "520px",
                lineHeight: 1.65,
              }}
            >
              Tournaments, workshops, and open debates hosted by Chittagong Debate Circle.
            </p>
          </div>

          {/* ── Search + Filters bar ── */}
          <div
            style={{
              background: "#FFFDF9",
              borderRadius: "16px",
              border: "1px solid rgba(180,140,80,0.14)",
              boxShadow: "0 2px 12px rgba(180,140,80,0.08)",
              padding: "1.1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.75rem",
            }}
          >
            {/* Search input */}
            <div style={{ position: "relative" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888"
                strokeWidth="2"
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search events by title, location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  borderRadius: "10px",
                  border: "1.5px solid rgba(180,140,80,0.18)",
                  background: "transparent",
                  fontSize: "0.88rem",
                  color: "#111111",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888888",
                    padding: "0.1rem",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Type chips */}
            {eventTypes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#888888", fontWeight: 600, marginRight: "0.2rem" }}>
                  Type:
                </span>
                {["all", ...eventTypes].map((type) => (
                  <button
                    key={type}
                    className="type-chip"
                    onClick={() => setTypeFilter(type)}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      border: "1.5px solid",
                      cursor: "pointer",
                      transition: "all 0.18s",
                      borderColor:
                        typeFilter === type ? "#006A4E" : "rgba(180,140,80,0.20)",
                      background:
                        typeFilter === type ? "rgba(0,106,78,0.09)" : "transparent",
                      color: typeFilter === type ? "#006A4E" : "#555555",
                    }}
                  >
                    {type === "all" ? "All types" : type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              marginBottom: "1.75rem",
              borderBottom: "1.5px solid rgba(180,140,80,0.14)",
              paddingBottom: "0",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: tab === t.key ? "#006A4E" : "#888888",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t.key ? "2.5px solid #006A4E" : "2.5px solid transparent",
                  padding: "0.6rem 1rem",
                  cursor: "pointer",
                  marginBottom: "-1.5px",
                  transition: "color 0.18s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {t.label}
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.45rem",
                    borderRadius: "999px",
                    background:
                      tab === t.key ? "rgba(0,106,78,0.10)" : "rgba(136,136,136,0.10)",
                    color: tab === t.key ? "#006A4E" : "#888888",
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Results summary ── */}
          {!loading && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#888888",
                margin: "0 0 1.25rem",
              }}
            >
              {filtered.length === 0
                ? "No results"
                : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}`}
              {search && ` for "${search}"`}
            </p>
          )}

          {/* ── Grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? <EmptyState filtered={search || typeFilter !== "all"} />
              : filtered.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        </div>
      </div>
    </>
  );
}