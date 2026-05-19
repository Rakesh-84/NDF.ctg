import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";



const PRIORITY_CONFIG = {
  high:   { label: "Urgent",  color: "#D42027", bg: "rgba(212,32,39,0.08)"  },
  medium: { label: "Notice",  color: "#B87333", bg: "rgba(184,115,51,0.08)" },
  low:    { label: "Info",    color: "#006A4E", bg: "rgba(0,106,78,0.08)"   },
};

function getPriority(a) {
  return PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.low;
}

export default function Announcements() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error) setItems(data || []);
      setLoading(false);
    }
    fetchAnnouncements();
  }, []);

  const filtered = items.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.content?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((a) => a.is_pinned || a.priority === "high");
  const regular = filtered.filter((a) => !a.is_pinned && a.priority !== "high");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;1,800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes bgBreathe {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes urgentPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,32,39,0.15); }
          50%      { box-shadow: 0 0 0 8px rgba(212,32,39,0); }
        }

        .ann-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 100px;
        }
        .fraunces { font-family:'Fraunces',serif; }

        .wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* card base */
        .ann-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 14px;
          transition: box-shadow .2s, transform .2s;
          animation: fadeUp .4s ease both;
        }
        .ann-card:hover {
          box-shadow: 0 8px 32px rgba(180,140,80,0.18);
          transform: translateY(-2px);
        }
        .ann-card.urgent {
          border-left: 4px solid #D42027;
          animation: fadeUp .4s ease both, urgentPulse 2.5s ease infinite;
        }
        .ann-card.pinned {
          border-left: 4px solid #006A4E;
        }

        /* header row */
        .ann-header {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px 22px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        /* badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* search */
        .search-box {
          width: 100%;
          padding: 12px 16px 12px 40px;
          background: #FFFDF9;
          border: 1.5px solid rgba(180,140,80,0.22);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .search-box:focus {
          border-color: #006A4E;
          box-shadow: 0 0 0 3px rgba(0,106,78,.08);
        }

        /* skeleton */
        .sk {
          background: linear-gradient(90deg,#f0ebe3 25%,#faf6f0 50%,#f0ebe3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }

        /* section label */
        .section-lbl {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #888;
          margin: 28px 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-lbl::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(180,140,80,0.15);
        }

        /* expand body */
        .ann-body {
          padding: 0 22px 20px;
          font-size: 15px;
          color: #444;
          line-height: 1.75;
          border-top: 1px solid rgba(180,140,80,0.10);
          padding-top: 16px;
        }

        /* chevron */
        .chevron {
          font-size: 12px;
          color: #aaa;
          margin-left: auto;
          flex-shrink: 0;
          margin-top: 3px;
          transition: transform .2s;
        }
        .chevron.open { transform: rotate(180deg); }

        /* pinned strip */
        .pinned-strip {
          background: linear-gradient(135deg,#006A4E,#1A3A2A);
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          animation: fadeUp .3s ease both;
        }
      `}</style>

      <div className="ann-root">
        <div className="wrap">

          {/* ── PAGE HEADER ────────────────────────── */}
          <div style={{ padding: "clamp(32px,6vw,64px) 0 clamp(20px,4vw,40px)", animation: "fadeUp .5s ease" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#D42027", marginBottom: 10 }}>
              📢 Official Updates
            </p>
            <h1
              className="fraunces"
              style={{
                fontSize: "clamp(30px,6vw,52px)",
                background: "linear-gradient(135deg,#006A4E 0%,#1A3A2A 60%,#004D38 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.15,
                margin: "0 0 14px",
              }}
            >
              Announcements
            </h1>
            <p style={{ color: "#555", fontSize: 16, margin: 0, lineHeight: 1.6 }}>
              Stay up to date with the latest news, notices, and updates from NDFCTG.
            </p>
          </div>

          {/* ── SEARCH ─────────────────────────────── */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 16 }}>🔍</span>
            <input
              className="search-box"
              placeholder="Search announcements…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ── LOADING ────────────────────────────── */}
          {loading && (
            <div style={{ marginTop: 20 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ background: "#FFFDF9", borderRadius: 16, padding: 22, marginBottom: 14, border: "1px solid rgba(255,255,255,.95)", boxShadow: "0 4px 20px rgba(180,140,80,.10)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div className="sk" style={{ width: 60, height: 22 }} />
                    <div className="sk" style={{ width: 80, height: 14 }} />
                  </div>
                  <div className="sk" style={{ height: 18, marginBottom: 8 }} />
                  <div className="sk" style={{ height: 14, width: "60%" }} />
                </div>
              ))}
            </div>
          )}

          {/* ── EMPTY ──────────────────────────────── */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
              <p style={{ fontSize: 17, fontWeight: 500, color: "#555", margin: "0 0 6px" }}>No announcements found</p>
              <p style={{ fontSize: 14 }}>Check back soon for updates.</p>
            </div>
          )}

          {/* ── PINNED / URGENT ────────────────────── */}
          {!loading && pinned.length > 0 && (
            <>
              <p className="section-lbl">📌 Pinned & Urgent</p>
              {pinned.map((a, i) => (
                <AnnouncementCard
                  key={a.id}
                  item={a}
                  delay={i * 0.06}
                  expanded={expanded === a.id}
                  onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                />
              ))}
            </>
          )}

          {/* ── REGULAR ────────────────────────────── */}
          {!loading && regular.length > 0 && (
            <>
              {pinned.length > 0 && <p className="section-lbl">All Announcements</p>}
              {regular.map((a, i) => (
                <AnnouncementCard
                  key={a.id}
                  item={a}
                  delay={i * 0.05}
                  expanded={expanded === a.id}
                  onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                />
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}

function AnnouncementCard({ item, delay, expanded, onToggle }) {
  const p = getPriority(item);
  const isUrgent = item.priority === "high";
  const isPinned = item.is_pinned && !isUrgent;

  return (
    <div
      className={`ann-card ${isUrgent ? "urgent" : isPinned ? "pinned" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <button className="ann-header" onClick={onToggle}>
        {/* left: badge + content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span
              className="badge"
              style={{ background: p.bg, color: p.color }}
            >
              {isUrgent && "🚨 "}{p.label}
            </span>
            {item.is_pinned && (
              <span className="badge" style={{ background: "rgba(0,106,78,0.08)", color: "#006A4E" }}>
                📌 Pinned
              </span>
            )}
            <span style={{ fontSize: 12, color: "#aaa" }}>
              {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#111",
              fontFamily: "'Fraunces',serif",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </p>
          {!expanded && item.content && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888", lineHeight: 1.5 }}>
              {item.content.slice(0, 120)}{item.content.length > 120 ? "…" : ""}
            </p>
          )}
        </div>
        {/* chevron */}
        <span className={`chevron ${expanded ? "open" : ""}`}>▼</span>
      </button>

      {/* expanded body */}
      {expanded && (
        <div className="ann-body">
          {item.content}
          {item.link && (
            <div style={{ marginTop: 14 }}>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  background: "#006A4E",
                  color: "#fff",
                  borderRadius: 9,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Learn More →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}