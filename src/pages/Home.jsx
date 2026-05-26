import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import NdfLogo from "../assets/Ndf.png";



/* ─── tiny helper ─────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Announcement Ticker ─────────────────────────────────── */
function AnnouncementTicker({ items }) {
  const text =
    items.length > 0
      ? items.map((a) => a.title).join("   ·   ")
      : "Welcome to NDF BD.ctg — Stay tuned for upcoming events";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #D42027, #A8181E)",
        color: "#fff",
        fontSize: "0.78rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        letterSpacing: "0.03em",
        overflow: "hidden",
        height: "32px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        zIndex: 50,
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "0 1.5rem",
          background: "rgba(0,0,0,0.18)",
          height: "100%",
          lineHeight: "32px",
          whiteSpace: "nowrap",
          flexShrink: 0,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        NOTICE
      </span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          <span>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      <style>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────── */
function Navbar({ isScrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Events", to: "/events" },
    { label: "Gallery", to: "/gallery" }, 
    { label: "Blog", to: "/blog" },
    { label: "Announcements", to: "/announcements" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: isScrolled
          ? "rgba(253,248,242,0.92)"
          : "rgba(253,248,242,0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: isScrolled
          ? "1px solid rgba(180,140,80,0.18)"
          : "1px solid transparent",
        transition: "all 0.3s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.25rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "34px",
              height: "24px",
              borderRadius: "0px",
              background: "linear-gradient(135deg, #006A4E 0%, #004D38 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
           <img src={NdfLogo} alt="NDF BD.ctg Logo" />
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: "1rem", color: "#111111", lineHeight: 1.1 }}>
              NDF BD Chattogram
            </div>
           
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: "0.15rem", alignItems: "center" }} className="hide-mobile">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                color: "#555555",
                textDecoration: "none",
                fontSize: "0.84rem",
                fontWeight: 500,
                padding: "0.4rem 0.75rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#006A4E";
                e.target.style.background = "rgba(0,106,78,0.07)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#555555";
                e.target.style.background = "transparent";
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons (desktop) */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} className="hide-mobile">
          {user ? (
            <>
              <Link
                to={isAdmin ? "/admin/dashboard" : "/member/dashboard"}
                style={{
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  color: "#006A4E",
                  textDecoration: "none",
                  padding: "0.4rem 1rem",
                  borderRadius: "8px",
                  border: "1.5px solid #006A4E",
                  transition: "all 0.2s",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                style={{
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  color: "#555555",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.4rem 0.75rem",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  color: "#555555",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                }}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                style={{
                  fontSize: "0.83rem",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  padding: "0.45rem 1.1rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #006A4E, #004D38)",
                  boxShadow: "0 2px 8px rgba(0,106,78,0.25)",
                }}
              >
                Join
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
            display: "none",
            flexDirection: "column",
            gap: "5px",
          }}
          className="show-mobile-flex"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "#111111",
                borderRadius: "2px",
                transition: "all 0.3s ease",
                transformOrigin: "center",
                transform:
                  menuOpen
                    ? i === 0
                      ? "translateY(7px) rotate(45deg)"
                      : i === 2
                      ? "translateY(-7px) rotate(-45deg)"
                      : "scaleX(0)"
                    : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
          background: "rgba(253,248,242,0.98)",
          borderTop: menuOpen ? "1px solid rgba(180,140,80,0.12)" : "none",
        }}
      >
        <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#555555",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            {user ? (
              <Link
                to={isAdmin ? "/admin/dashboard" : "/member/dashboard"}
                onClick={() => setMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  padding: "0.65rem",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #006A4E, #004D38)",
                }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#006A4E",
                    textDecoration: "none",
                    padding: "0.65rem",
                    borderRadius: "10px",
                    border: "1.5px solid #006A4E",
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#fff",
                    textDecoration: "none",
                    padding: "0.65rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #006A4E, #004D38)",
                  }}
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hide-mobile { display: flex !important; }
          .show-mobile-flex { display: none !important; }
        }
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
          .show-mobile-flex { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

/* ─── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      style={{
        padding: "2rem 1rem 0rem",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "2.5rem",
        alignItems: "center",
      }}
    >
      {/* Badge */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(0,106,78,0.08)",
            border: "1px solid rgba(0,106,78,0.18)",
            borderRadius: "999px",
            padding: "0.1rem 0.2rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#006A4E",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#006A4E", display: "inline-block" }} />
          Spreading logic everywhere
        </span>
      </div>

      {/* H1 */}
      <div style={{ textAlign: "center" }}>
        <h1
                  style={{
                    
            fontFamily: 'Tiro Bangla',
    fontWeight: 800,
    fontSize: "clamp(2.6rem, 7vw, 5rem)",
    lineHeight: 2,        
    color: "#111111",
    paddingTop: "1rem",   
    margin: 0,
     padding: "0.5rem 0",  
  overflow: "visible",
           
          }}
        >
          শোন,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingTop: "1rem",
               overflow: "visible",
            }}
          >
             যুক্তিই আমার সৌন্দর্য
          </span>
        </h1>
        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            fontWeight: 800,
            color: "#555555",
            fontFamily: 'Tiro Bangla',
            lineHeight: 1,
            maxWidth: "580px",
            margin: "1.25rem auto 0",
          }}
        >
       যুক্তি, প্রজ্ঞা ও নেতৃত্বের এক অনন্য প্ল্যাটফর্ম
              </p>
          

        {/* CTA row */}
        <div
          style={{
            display: "flex",
            gap: "0.85rem",
            justifyContent: "center",
            marginTop: "2.25rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/signup"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#fff",
              textDecoration: "none",
              padding: "0.8rem 1.8rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #006A4E, #004D38)",
              boxShadow: "0 4px 16px rgba(0,106,78,0.30), 0 1px 4px rgba(0,0,0,0.06)",
              transition: "transform 0.18s, box-shadow 0.18s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,106,78,0.38), 0 2px 6px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,106,78,0.30), 0 1px 4px rgba(0,0,0,0.06)";
            }}
          >
            Become a Member
          </Link>
          <Link
            to="/events"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#111111",
              textDecoration: "none",
              padding: "0.8rem 1.8rem",
              borderRadius: "12px",
              background: "#FFFDF9",
              border: "1.5px solid rgba(180,140,80,0.22)",
              boxShadow: "0 2px 8px rgba(180,140,80,0.10)",
              display: "inline-block",
              transition: "transform 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            View Events →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Row ───────────────────────────────────────────── */
function StatsRow({ stats }) {
  const items = [
    { label: "Members", value: stats.members ?? "—" },
    { label: "Events Hosted", value: stats.events ?? "—" },
    { label: "Blog Posts", value: stats.posts ?? "—" },
    { label: "Years Running", value: stats.years ?? "10+" },
  ];
  return (
    <div
      style={{
        background: "rgba(0,106,78,0.04)",
        borderTop: "1px solid rgba(0,106,78,0.10)",
        borderBottom: "1px solid rgba(0,106,78,0.10)",
        padding: "2rem 1.25rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem 1rem",
        }}
        className="stats-grid"
      >
        {items.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 2.8rem)",
                color: "#006A4E",
                lineHeight: 1,
              }}
            >
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "#888888",
                marginTop: "0.3rem",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Section Header ──────────────────────────────────────── */
function SectionHeader({ title, subtitle, linkTo, linkLabel }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            color: "#111111",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#888888",
              fontSize: "0.88rem",
              margin: "0.3rem 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#006A4E",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            whiteSpace: "nowrap",
          }}
        >
          {linkLabel || "See all"} →
        </Link>
      )}
    </div>
  );
}

/* ─── Event Card ──────────────────────────────────────────── */
function EventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "#FFFDF9",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 20px rgba(180,140,80,0.10), 0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          cursor: "pointer",
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
        {/* Color band */}
        <div
          style={{
            height: "5px",
            background: "linear-gradient(90deg, #006A4E, #1A3A2A)",
          }}
        />
        <div style={{ padding: "1.25rem" }}>
          {/* Date chip */}
          <div
            style={{
              display: "inline-block",
              background: "rgba(0,106,78,0.08)",
              color: "#006A4E",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              marginBottom: "0.75rem",
              letterSpacing: "0.04em",
            }}
          >
            {formatDate(event.event_date)}
          </div>

          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#111111",
              margin: "0 0 0.5rem",
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h3>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.84rem",
              color: "#555555",
              margin: "0 0 1rem",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.description || "Join us for this exciting debate event."}
          </p>

          {/* Location + type */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
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

/* ─── Blog Card ───────────────────────────────────────────── */
function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FFFDF9",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 20px rgba(180,140,80,0.10), 0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          cursor: "pointer",
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
        {/* Cover image or fallback */}
        {post.cover_image_url ? (
          <div
            style={{
              height: "160px",
              overflow: "hidden",
              background: "#f0ebe3",
            }}
          >
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              height: "90px",
              background: "linear-gradient(135deg, rgba(0,106,78,0.06), rgba(0,106,78,0.12))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,106,78,0.35)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        )}
        <div style={{ padding: "1.15rem", flex: 1 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem",
              color: "#888888",
              marginBottom: "0.5rem",
            }}
          >
            {formatDate(post.created_at)} · {post.author_name || "Member"}
          </div>
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: "1rem",
              color: "#111111",
              margin: "0 0 0.45rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.title}
          </h3>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.83rem",
              color: "#555555",
              margin: 0,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt || post.content?.substring(0, 120) + "…"}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Join CTA Section ────────────────────────────────────── */
function JoinCTA() {
  return (
    <section style={{ padding: "4.5rem 1.25rem" }}>
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
          borderRadius: "24px",
          padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 3.5rem)",
          textAlign: "center",
          boxShadow: "0 16px 48px rgba(0,106,78,0.28), 0 4px 12px rgba(0,0,0,0.10)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rings */}
        {[220, 340, 460].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              right: `-${size / 3}px`,
              transform: "translateY(-50%)",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "999px",
            padding: "0.3rem 1rem",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          Open Membership
        </div>

        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            color: "#ffffff",
            margin: "0 0 1rem",
            lineHeight: 1.15,
          }}
        >
          Ready to find your voice?
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            color: "rgba(255,255,255,0.75)",
            maxWidth: "520px",
            margin: "0 auto 2rem",
            lineHeight: 1.65,
          }}
        >
          Join NDF BD.ctg and become part of a community that
          challenges ideas, builds confidence, and creates impact.
        </p>
        <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/signup"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#006A4E",
              textDecoration: "none",
              padding: "0.85rem 2rem",
              borderRadius: "12px",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              transition: "transform 0.18s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Apply to Join
          </Link>
          <Link
            to="/about"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              padding: "0.85rem 2rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(255,255,255,0.28)",
              display: "inline-block",
              transition: "transform 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      heading: "Platform",
      links: [
        { label: "Home", to: "/" },
        { label: "About", to: "/about" },
        { label: "Events", to: "/events" },
        { label: "Blog", to: "/blog" },
      ],
    },
    {
      heading: "Members",
      links: [
        { label: "Join", to: "/signup" },
        { label: "Log In", to: "/login" },
        { label: "Dashboard", to: "/member/dashboard" },
        { label: "Write a Post", to: "/member/write" },
      ],
    },
    {
      heading: "More",
      links: [
        { label: "Announcements", to: "/announcements" },
        { label: "Notices", to: "/notices" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(180,140,80,0.14)",
        background: "#FFFDF9",
        padding: "3rem 1.25rem 5.5rem", // extra bottom for fixed nav
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2.5rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={NdfLogo} alt="NDF BD.ctg Logo" />
              </div>
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#111111",
                }}
              >
                NDF BD Chattogram
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.84rem",
                color: "#888888",
                lineHeight: 1.6,
                maxWidth: "260px",
                margin: 0,
              }}
            >
              Empowering voices, shaping thinkers, and building leaders 
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <h4
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  color: "#111111",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 0.85rem",
                }}
              >
                {col.heading}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        color: "#555555",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#006A4E")}
                      onMouseLeave={(e) => (e.target.style.color = "#555555")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(180,140,80,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "#888888",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} NDF BD.ctg. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "#888888",
              margin: 0,
            }}
          >
            Built by Kleandash with ❤️ Rex (Rakesh Das)
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

/* ─── Fixed Bottom Nav (Mobile) ───────────────────────────── */
function BottomNav() {
  const { user, isAdmin } = useAuth();
  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: "Events",
      to: "/events",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: "Blog",
      to: "/blog",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
    },
    user
      ? {
          label: isAdmin ? "Admin" : "Profile",
          to: isAdmin ? "/admin/dashboard" : "/member/dashboard",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ),
        }
      : {
          label: "Join",
          to: "/signup",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          ),
        },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(253,248,242,0.96)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(180,140,80,0.16)",
        display: "flex",
        justifyContent: "space-around",
        padding: "0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom, 0px))",
      }}
      className="bottom-nav"
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.2rem",
            textDecoration: "none",
            color: "#888888",
            padding: "0.35rem 1.2rem",
            borderRadius: "12px",
            transition: "color 0.18s",
            fontSize: "0.66rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
          style-active={{ color: "#006A4E" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
      <style>{`
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE (main export)
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* data fetch */
  useEffect(() => {
    async function fetchAll() {
      try {
        const [annRes, evRes, postRes, memRes] = await Promise.all([
          supabase
            .from("announcements")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("events")
            .select("id, title, description, event_date, location, event_type")
            .gte("event_date", new Date().toISOString())
            .order("event_date", { ascending: true })
            .limit(3),
          supabase
            .from("posts")
            .select("id, title, excerpt, content, cover_image_url, created_at, author_name")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.from("members").select("id", { count: "exact", head: true }),
        ]);

        setAnnouncements(annRes.data || []);
        setEvents(evRes.data || []);
        setPosts(postRes.data || []);
        setStats({
          members: memRes.count ?? 0,
          events: (evRes.data || []).length,   // replace with full count if needed
          posts: (postRes.data || []).length,
          years: "10+",
        });
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Global background + keyframes */}
      <style>{`
        body {
          margin: 0;
          background: linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          min-height: 100vh;
        }
        @keyframes bgBreathe {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Structure ── */}
      <AnnouncementTicker items={announcements} />
      <Navbar isScrolled={isScrolled} />

      <main style={{ paddingBottom: "5rem" }}>
        <HeroSection />
        <StatsRow stats={stats} />

        {/* Upcoming Events */}
        <section style={{ padding: "3.5rem 1.25rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeader
            title="Upcoming Events"
            subtitle="Don't miss these debates and workshops"
            linkTo="/events"
            linkLabel="All events"
          />
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "180px",
                    borderRadius: "16px",
                    background: "rgba(180,140,80,0.06)",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#888888",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem",
              }}
            >
              No upcoming events at the moment. Check back soon!
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>

        {/* Latest Blog Posts */}
        <section style={{ padding: "3.5rem 1.25rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeader
            title="From the Blog"
            subtitle="Insights, recaps, and essays from our members"
            linkTo="/blog"
            linkLabel="All posts"
          />
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "260px",
                    borderRadius: "16px",
                    background: "rgba(180,140,80,0.06)",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#888888",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem",
              }}
            >
              No published posts yet. Be the first to write!
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>

        <JoinCTA />
      </main>

      <Footer />
      <BottomNav />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}