import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../../components/ui/layout/Breadcrumb";

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function WritePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const coverInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverImagePath, setCoverImagePath] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);

  // word count
  const wordCount = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    async function fetchPost() {
      if (!editId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("title, slug, excerpt, body, cover_image_path, status")
          .eq("id", editId)
          .eq("author_id", user.id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setExcerpt(data.excerpt || "");
          setBody(data.body || "");
          setCoverImagePath(data.cover_image_path || "");
          if (data.cover_image_path) {
            const { data: urlData } = supabase.storage
              .from("post-covers")
              .getPublicUrl(data.cover_image_path);
            setCoverPreview(urlData.publicUrl);
          }
          setSlugManuallyEdited(true); // don't auto-overwrite slug on edit
        }
      } catch {
        setError("Failed to load post. It may not exist or belong to you.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [editId, user]);

  // Auto-generate slug from title (only if not manually edited)
  function handleTitleChange(e) {
  const newTitle = e.target.value;
  setTitle(newTitle);
  if (!slugManuallyEdited) {
    setSlug(generateSlug(newTitle));
  }
}

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Cover image must be under 3MB.");
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-covers")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      setCoverImagePath(filePath);
    } catch {
      setError("Cover upload failed. Try again.");
      setCoverPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeCover() {
    setCoverImagePath("");
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  async function handleSubmit(status) {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    if (!body.trim()) { setError("Post body cannot be empty."); return; }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        body: body.trim(),
        cover_image_path: coverImagePath || null,
        status,
        author_id: user.id,
        updated_at: new Date().toISOString(),
        ...(status === "published" && { published_at: new Date().toISOString() }),
      };

      let postError;

      if (editId) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", editId)
          .eq("author_id", user.id);
        postError = error;
      } else {
        const { error } = await supabase
          .from("posts")
          .insert({ ...payload, created_at: new Date().toISOString() });
        postError = error;
      }

      if (postError) throw postError;

      setSuccess(status === "published" ? "Post published!" : "Draft saved!");
      setTimeout(() => navigate("/member/my-posts"), 1200);
    } catch {
      setError("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid #E8D5B0",
              borderTopColor: "#006A4E",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#888888", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            {editId ? "Loading post…" : "Preparing editor…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FDF8F2, #F5EFE6, #EEF5F1, #FAF3E8, #F0F7F4)",
        backgroundSize: "300% 300%",
        animation: "bgBreathe 14s ease infinite",
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 120,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wp-input:focus {
          outline: none;
          border-color: #006A4E !important;
          box-shadow: 0 0 0 3px rgba(0,106,78,0.10) !important;
        }
        .wp-title-input::placeholder { color: #C8B89A; }
        .wp-publish-btn:hover:not(:disabled) {
          background: #005540 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,106,78,0.25) !important;
        }
        .wp-draft-btn:hover:not(:disabled) {
          border-color: #006A4E !important;
          color: #006A4E !important;
          background: rgba(0,106,78,0.04) !important;
        }
        .wp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .wp-cover-zone:hover { border-color: #006A4E !important; }
        .wp-remove-cover:hover { background: #D42027 !important; color: #fff !important; }
        .wp-slug-badge { transition: background 0.2s; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>

        {/* Breadcrumb */}
        <div style={{ paddingTop: 20 }}>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/member/dashboard" },
              { label: "My Posts", href: "/member/my-posts" },
              { label: editId ? "Edit Post" : "Write Post" },
            ]}
          />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 24, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: "clamp(26px, 6vw, 34px)",
                background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              {editId ? "Edit Post" : "Write Post"}
            </h1>
            {/* Live stats pill */}
            {body.trim() && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#888888",
                  background: "#F0EBE0",
                  padding: "4px 10px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                {wordCount} words · {readTime} min read
              </span>
            )}
          </div>
          <p style={{ color: "#888888", fontSize: 14, margin: "6px 0 0" }}>
            {editId ? "Update your post below" : "Share your thoughts with the community"}
          </p>
        </div>

        {/* Feedback banners */}
        {error && (
          <div
            style={{
              background: "#FFF0F0",
              border: "1px solid #F5C5C5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#D42027",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#F0FBF6",
              border: "1px solid #B2E2CE",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#006A4E",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <span>✅</span> {success} — redirecting…
          </div>
        )}

        {/* Cover image */}
        <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease 0.05s both" }}>
          {coverPreview ? (
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
              <img
                src={coverPreview}
                alt="Cover preview"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Uploading overlay */}
              {uploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,253,249,0.75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid #E8D5B0",
                      borderTopColor: "#006A4E",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#555555", fontWeight: 500 }}>Uploading…</span>
                </div>
              )}
              {/* Controls overlay */}
              {!uploading && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(255,253,249,0.92)",
                      border: "1px solid #E8D5B0",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#555555",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="wp-remove-cover"
                    onClick={removeCover}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(255,253,249,0.92)",
                      border: "1px solid #F5C5C5",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#D42027",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="wp-cover-zone"
              onClick={() => coverInputRef.current?.click()}
              style={{
                border: "2px dashed #E8D5B0",
                borderRadius: 14,
                padding: "32px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: "#FFFDF9",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#555555" }}>
                Add a cover image
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#AAAAAA" }}>
                Click to upload · Max 3MB · JPG, PNG, WebP
              </p>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverChange}
          />
        </div>

        {/* Main editor card */}
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(255,255,255,0.95)",
            borderRadius: 18,
            boxShadow: "0 4px 20px rgba(180,140,80,0.10)",
            padding: "28px 24px",
            animation: "fadeUp 0.45s ease 0.08s both",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#555555",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Title <span style={{ color: "#D42027" }}>*</span>
            </label>
            <input
              className="wp-input wp-title-input"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Give your post a great title…"
              maxLength={200}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #E8D5B0",
                borderRadius: 10,
                fontSize: 18,
                fontWeight: 600,
                fontFamily: "'Fraunces', serif",
                color: "#111111",
                background: "#FFFDF9",
                boxSizing: "border-box",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>

          {/* Slug */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#555555",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Slug <span style={{ color: "#D42027" }}>*</span>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#888888",
                  background: "#F0EBE0",
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                auto-generated · editable
              </span>
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #E8D5B0",
                borderRadius: 10,
                overflow: "hidden",
                background: "#FFFDF9",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <span
                style={{
                  padding: "11px 12px",
                  fontSize: 13,
                  color: "#AAAAAA",
                  background: "#F5F0E8",
                  borderRight: "1px solid #E8D5B0",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                /blog/
              </span>
              <input
                className="wp-input"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  setSlugManuallyEdited(true);
                }}
                placeholder="post-slug-here"
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  border: "none",
                  fontSize: 14,
                  color: "#111111",
                  background: "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#555555",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Excerpt
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#AAAAAA",
                }}
              >
                shown on blog listing
              </span>
            </label>
            <textarea
              className="wp-input"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of your post (1–2 sentences)…"
              rows={2}
              maxLength={300}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #E8D5B0",
                borderRadius: 10,
                fontSize: 14,
                color: "#111111",
                background: "#FFFDF9",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.6,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            <p style={{ fontSize: 12, color: "#AAAAAA", margin: "4px 0 0", textAlign: "right" }}>
              {excerpt.length} / 300
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, #E8D5B0, transparent)",
              margin: "4px 0 20px",
            }}
          />

          {/* Body */}
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#555555",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Content <span style={{ color: "#D42027" }}>*</span>
            </label>
            <textarea
              className="wp-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post here… Markdown is supported on the public blog."
              rows={18}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #E8D5B0",
                borderRadius: 10,
                fontSize: 15,
                color: "#111111",
                background: "#FEFCF8",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.75,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <p style={{ fontSize: 12, color: "#AAAAAA", margin: 0 }}>
                Markdown supported
              </p>
              <p style={{ fontSize: 12, color: "#AAAAAA", margin: 0 }}>
                {wordCount} words · ~{readTime} min read
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons — sticky feel via margin */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 20,
            animation: "fadeUp 0.5s ease 0.12s both",
          }}
        >
          <button
            type="button"
            className="wp-btn wp-publish-btn"
            disabled={saving || uploading}
            onClick={() => handleSubmit("published")}
            style={{
              flex: 1,
              minWidth: 160,
              padding: "14px 24px",
              background: "#006A4E",
              color: "#FFFDF9",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <span style={{ fontSize: 16 }}>🌿</span>
                {editId ? "Update & Publish" : "Publish Post"}
              </>
            )}
          </button>

          <button
            type="button"
            className="wp-btn wp-draft-btn"
            disabled={saving || uploading}
            onClick={() => handleSubmit("draft")}
            style={{
              flex: 1,
              minWidth: 140,
              padding: "14px 24px",
              background: "transparent",
              color: "#555555",
              border: "1px solid #E8D5B0",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s, background 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>📝</span>
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => navigate("/member/my-posts")}
            style={{
              padding: "14px 20px",
              background: "transparent",
              color: "#AAAAAA",
              border: "1px solid #E8D5B0",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#555555"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#AAAAAA"; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}