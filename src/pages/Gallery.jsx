import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

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

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState("all");
  const [lightbox, setLightbox] = useState(null); // { url, name, eventName, index }
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      setError("");

      try {
        // 1. Fetch all events for filter labels
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title")
          .order("date", { ascending: false });

        const eventsMap = {};
        (eventsData || []).forEach((e) => { eventsMap[e.id] = e.title; });
        setEvents(eventsData || []);

        // 2. List all files in event-photos bucket
        const { data: bucketData, error: bucketError } = await supabase.storage
          .from("event-photos")
          .list("", { limit: 500, offset: 0, sortBy: { column: "created_at", order: "desc" } });

        if (bucketError) throw new Error(bucketError.message);

        if (!bucketData || bucketData.length === 0) {
          setPhotos([]);
          setLoading(false);
          return;
        }

        // 3. For each folder (event id), list its files
        const allPhotos = [];

        for (const folder of bucketData) {
          // folders have no metadata.size or it's 0 — files have size
          if (!folder.id || folder.metadata) {
            // It's a file at root level
            const { data: urlData } = supabase.storage
              .from("event-photos")
              .getPublicUrl(folder.name);
            allPhotos.push({
              key: folder.name,
              url: urlData.publicUrl,
              name: folder.name,
              eventId: null,
              eventName: "General",
              createdAt: folder.created_at,
            });
          } else {
            // It's a folder — list files inside
            const { data: files } = await supabase.storage
              .from("event-photos")
              .list(folder.name, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

            (files || []).forEach((file) => {
              if (!file.metadata) return; // skip sub-folders
              const path = `${folder.name}/${file.name}`;
              const { data: urlData } = supabase.storage
                .from("event-photos")
                .getPublicUrl(path);
              allPhotos.push({
                key: path,
                url: urlData.publicUrl,
                name: file.name,
                eventId: folder.name,
                eventName: eventsMap[folder.name] || folder.name,
                createdAt: file.created_at,
              });
            });
          }
        }

        setPhotos(allPhotos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  const filtered = activeEvent === "all"
    ? photos
    : photos.filter((p) => p.eventId === activeEvent);

  // Lightbox navigation
  const openLightbox = useCallback((photo, index) => {
    setLightbox({ ...photo, index });
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  const lightboxNav = useCallback((dir) => {
    setLightbox((prev) => {
      if (!prev) return null;
      const newIndex = (prev.index + dir + filtered.length) % filtered.length;
      const next = filtered[newIndex];
      return { ...next, index: newIndex };
    });
  }, [filtered]);

  useEffect(() => {
    function handleKey(e) {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lightboxNav(1);
      if (e.key === "ArrowLeft") lightboxNav(-1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox, lightboxNav]);

  // Unique event folders for filter
  const eventFilters = events.filter((e) =>
    photos.some((p) => p.eventId === e.id)
  );

  return (
    <>
      <style>{`
        ${fonts}
        @keyframes bgBreathe {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .photo-card {
          cursor: pointer;
          overflow: hidden;
          border-radius: 12px;
          background: #FFFDF9;
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border: 1px solid rgba(255,255,255,0.95);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          break-inside: avoid;
          margin-bottom: 14px;
          animation: fadeIn 0.4s ease both;
        }
        .photo-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 36px rgba(180,140,80,0.22);
        }
        .photo-card img {
          width: 100%;
          display: block;
          transition: transform 0.4s ease;
        }
        .photo-card:hover img { transform: scale(1.04); }
        .filter-chip {
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .filter-chip:hover { opacity: 0.85; }
        .lb-arrow {
          background: rgba(255,255,255,0.12);
          border: none;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .lb-arrow:hover { background: rgba(255,255,255,0.22); }
        .shimmer-box {
          background: linear-gradient(90deg, #F5EFE6 25%, #EDE6D5 50%, #F5EFE6 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
          margin-bottom: 14px;
        }
      `}</style>

      <div style={bgStyle}>
        {/* Hero header */}
        <div style={{
          background: "#FFFDF9",
          borderBottom: "1px solid #EDE6D9",
          padding: "32px 20px 24px",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: "400", fontSize: "14px", color: "#888888", margin: "0 0 6px", letterSpacing: "0.02em" }}>
            Moments from the floor
          </p>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: "800",
            fontSize: "clamp(28px, 6vw, 42px)",
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}>
            Photo Gallery
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#888888" }}>
            {loading ? "Loading…" : `${photos.length} photo${photos.length !== 1 ? "s" : ""} across ${eventFilters.length} event${eventFilters.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
          {/* Error */}
          {error && (
            <div style={{ background: "rgba(212,32,39,0.08)", border: "1px solid rgba(212,32,39,0.20)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#D42027", fontSize: "14px", fontWeight: "600" }}>
              {error}
            </div>
          )}

          {/* Filter chips */}
          {!loading && eventFilters.length > 0 && (
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "24px", scrollbarWidth: "none" }}>
              <button
                className="filter-chip"
                onClick={() => setActiveEvent("all")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "24px",
                  border: "1px solid",
                  borderColor: activeEvent === "all" ? "#006A4E" : "#E0D8CC",
                  background: activeEvent === "all" ? "rgba(0,106,78,0.09)" : "#FFFDF9",
                  color: activeEvent === "all" ? "#006A4E" : "#555555",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                All Events
              </button>
              {eventFilters.map((e) => (
                <button
                  key={e.id}
                  className="filter-chip"
                  onClick={() => setActiveEvent(e.id)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "24px",
                    border: "1px solid",
                    borderColor: activeEvent === e.id ? "#006A4E" : "#E0D8CC",
                    background: activeEvent === e.id ? "rgba(0,106,78,0.09)" : "#FFFDF9",
                    color: activeEvent === e.id ? "#006A4E" : "#555555",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  {e.title}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ columns: "2 160px", columnGap: "14px" }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="shimmer-box"
                  style={{ height: i % 3 === 0 ? "220px" : i % 3 === 1 ? "160px" : "190px" }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{
              background: "#FFFDF9",
              boxShadow: "0 4px 20px rgba(180,140,80,0.10)",
              border: "1px solid rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "64px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>📷</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "20px", margin: "0 0 8px", color: "#111111" }}>
                No photos yet
              </h3>
              <p style={{ color: "#888888", margin: 0, fontSize: "14px" }}>
                {activeEvent !== "all" ? "No photos for this event." : "Photos will appear here once uploaded to events."}
              </p>
            </div>
          )}

          {/* Masonry grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ columns: "2 160px", columnGap: "14px" }}>
              {filtered.map((photo, i) => (
                <div
                  key={photo.key}
                  className="photo-card"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s` }}
                  onClick={() => openLightbox(photo, i)}
                >
                  <div style={{ overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                    <img
                      src={photo.url}
                      alt={photo.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.parentElement.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                  {/* Caption bar */}
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{
                      margin: 0,
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#006A4E",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {photo.eventName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,10,0.92)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "scaleIn 0.2s ease",
          }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Counter */}
          <p style={{ position: "absolute", top: "20px", left: "20px", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {lightbox.index + 1} / {filtered.length}
          </p>

          {/* Nav + image row */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%", maxWidth: "900px" }}
          >
            <button className="lb-arrow" onClick={() => lightboxNav(-1)}>‹</button>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <img
                src={lightbox.url}
                alt={lightbox.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 2px", fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "15px", color: "#fff" }}>
                  {lightbox.eventName}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
                  {lightbox.name}
                </p>
              </div>
            </div>

            <button className="lb-arrow" onClick={() => lightboxNav(1)}>›</button>
          </div>
        </div>
      )}
    </>
  );
}
