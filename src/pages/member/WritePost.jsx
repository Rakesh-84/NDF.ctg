import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["Debate", "Tournament", "Opinion", "News", "Guide"];

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function WritePost() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Debate",
    tags: "",
    status: "draft",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);
  const fileRef = useRef();

  function handleField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slug) next.slug = slugify(value);
      return next;
    });
  }

  function handleCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(statusOverride) {
    const finalStatus = statusOverride || form.status;
    setError("");
    setSuccess("");

    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content cannot be empty."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }

    setSaving(true);

    try {
      // 1. upload cover if present
      let cover_image_url = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `covers/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-covers")
          .upload(path, coverFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("post-covers").getPublicUrl(path);
        cover_image_url = urlData.publicUrl;
      }

      // 2. build tags array
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // 3. insert post
      const { data, error: insErr } = await supabase.from("posts").insert({
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        tags,
        cover_image_url,
        author_id: user.id,
        status: finalStatus,
        published_at: finalStatus === "published" ? new Date().toISOString() : null,
      }).select().single();

      if (insErr) throw insErr;

      setSuccess(finalStatus === "published" ? "Post published!" : "Draft saved.");
      setTimeout(() => {
        if (finalStatus === "published") navigate(`/blog/${data.slug || data.id}`);
        else navigate("/member/dashboard");
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;1,800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .write-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 120px;
        }
        .fraunces { font-family: 'Fraunces', serif; }
        .card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 18px;
          animation: fadeUp .4s ease both;
        }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 6px;
          letter-spacing: .02em;
        }
        .field-input {
          width: 100%;
          padding: 11px 14px;
          background: #FDFAF6;
          border: 1.5px solid rgba(180,140,80,0.20);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .field-input:focus {
          border-color: #006A4E;
          box-shadow: 0 0 0 3px rgba(0,106,78,.08);
        }
        textarea.field-input { resize: vertical; min-height: 120px; line-height: 1.6; }
        .content-area { min-height: 340px; font-size: 15px; line-height: 1.8; }

        .cover-drop {
          border: 2px dashed rgba(180,140,80,0.30);
          border-radius: 14px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: border-color .2s, background .2s;
          background: #FDFAF6;
        }
        .cover-drop:hover {
          border-color: #006A4E;
          background: rgba(0,106,78,.03);
        }

        .select-input {
          width: 100%;
          padding: 11px 14px;
          background: #FDFAF6;
          border: 1.5px solid rgba(180,140,80,0.20);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          transition: border-color .2s;
        }
        .select-input:focus { border-color: #006A4E; }

        .btn-primary {
          padding: 12px 28px;
          background: #006A4E;
          color: #fff;
          border: none;
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background .18s, transform .18s;
        }
        .btn-primary:hover:not(:disabled) { background: #004D38; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        .btn-secondary {
          padding: 12px 24px;
          background: transparent;
          color: #006A4E;
          border: 1.5px solid #006A4E;
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background .18s;
        }
        .btn-secondary:hover:not(:disabled) { background: rgba(0,106,78,.06); }
        .btn-secondary:disabled { opacity:.6; cursor:not-allowed; }

        .btn-ghost {
          padding: 12px 20px;
          background: transparent;
          color: #888;
          border: 1.5px solid rgba(180,140,80,0.25);
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .18s, color .18s;
        }
        .btn-ghost:hover:not(:disabled) { color: #555; border-color: #888; }

        .tab-btn {
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all .18s;
        }
        .tab-btn.active { background: #006A4E; color: #fff; }
        .tab-btn.inactive { background: transparent; color: #888; }
        .tab-btn.inactive:hover { color: #555; background: rgba(0,106,78,.05); }

        .alert-error {
          padding: 12px 16px;
          background: rgba(212,32,39,.08);
          border: 1px solid rgba(212,32,39,.20);
          border-radius: 10px;
          color: #D42027;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .alert-success {
          padding: 12px 16px;
          background: rgba(0,106,78,.08);
          border: 1px solid rgba(0,106,78,.20);
          border-radius: 10px;
          color: #006A4E;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .toolbar-btn {
          padding: 5px 10px;
          background: #EEF5F1;
          border: 1px solid rgba(0,106,78,.15);
          border-radius: 6px;
          font-size: 13px;
          color: #006A4E;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: background .15s;
        }
        .toolbar-btn:hover { background: rgba(0,106,78,.15); }

        .char-count { font-size: 11px; color: #aaa; text-align: right; margin-top: 4px; }

        /* preview prose */
        .prose h1,.prose h2,.prose h3 { font-family:'Fraunces',serif; color:#111; }
        .prose p { color:#444; font-size:16px; line-height:1.8; margin-bottom:16px; }
        .prose h1 { font-size:32px; margin-bottom:12px; }
        .prose h2 { font-size:24px; margin-bottom:10px; margin-top:28px; }
        .prose h3 { font-size:20px; margin-bottom:8px; margin-top:22px; }
      `}</style>

      <div className="write-root">
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px 0" }}>

          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <Link to="/member/dashboard" style={{ fontSize: 14, color: "#006A4E", textDecoration: "none", fontWeight: 600 }}>← Dashboard</Link>
              <h1 className="fraunces" style={{ fontSize: "clamp(24px,4vw,36px)", color: "#111", margin: "8px 0 4px" }}>Write a Post</h1>
              <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Share your thoughts with the community.</p>
            </div>
            {/* edit / preview tabs */}
            <div style={{ display: "flex", gap: 4, background: "#F5EFE6", borderRadius: 10, padding: 4 }}>
              <button className={`tab-btn ${!preview ? "active" : "inactive"}`} onClick={() => setPreview(false)}>✏️ Edit</button>
              <button className={`tab-btn ${preview ? "active" : "inactive"}`} onClick={() => setPreview(true)}>👁 Preview</button>
            </div>
          </div>

          {/* alerts */}
          {error && <div className="alert-error">⚠ {error}</div>}
          {success && <div className="alert-success">✓ {success}</div>}

          {/* ── EDIT MODE ───────────────────────────── */}
          {!preview && (
            <div style={{ display: "grid", gap: 20 }}>

              {/* cover image */}
              <div className="card" style={{ padding: 24 }}>
                <label className="field-label">Cover Image</label>
                {coverPreview ? (
                  <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 260 }}>
                    <img src={coverPreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.55)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="cover-drop" onClick={() => fileRef.current?.click()}>
                    <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleCover} />
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🖼</div>
                    <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Click to upload a cover image</p>
                    <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0 0" }}>JPG, PNG, WebP · Max 5MB</p>
                  </div>
                )}
              </div>

              {/* title + slug */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  <label className="field-label">Title *</label>
                  <input
                    className="field-input"
                    placeholder="Enter a compelling title…"
                    value={form.title}
                    onChange={(e) => handleField("title", e.target.value)}
                    style={{ fontSize: 18, fontFamily: "'Fraunces',serif", fontWeight: 800 }}
                  />
                  <div className="char-count">{form.title.length}/120</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="field-label">Slug (URL)</label>
                    <input
                      className="field-input"
                      placeholder="my-post-slug"
                      value={form.slug}
                      onChange={(e) => handleField("slug", slugify(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="field-label">Category</label>
                    <select
                      className="select-input"
                      value={form.category}
                      onChange={(e) => handleField("category", e.target.value)}
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* excerpt */}
              <div className="card" style={{ padding: 24 }}>
                <label className="field-label">Excerpt / Summary</label>
                <textarea
                  className="field-input"
                  style={{ minHeight: 80 }}
                  placeholder="A short description shown in listings…"
                  value={form.excerpt}
                  onChange={(e) => handleField("excerpt", e.target.value)}
                />
                <div className="char-count">{form.excerpt.length}/300</div>
              </div>

              {/* content */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label className="field-label" style={{ margin: 0 }}>Content *</label>
                  {/* quick formatting toolbar */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { label: "H2", insert: "\n\n## " },
                      { label: "H3", insert: "\n\n### " },
                      { label: "**B**", insert: "****" },
                    ].map((t) => (
                      <button
                        key={t.label}
                        className="toolbar-btn"
                        dangerouslySetInnerHTML={{ __html: t.label }}
                        onClick={() => handleField("content", form.content + t.insert)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  className="field-input content-area"
                  placeholder={`Start writing...\n\nUse ## for headings, **bold** for emphasis.\nSeparate paragraphs with blank lines.`}
                  value={form.content}
                  onChange={(e) => handleField("content", e.target.value)}
                />
                <div className="char-count">{form.content.split(/\s+/).filter(Boolean).length} words</div>
              </div>

              {/* tags */}
              <div className="card" style={{ padding: 24 }}>
                <label className="field-label">Tags (comma-separated)</label>
                <input
                  className="field-input"
                  placeholder="debate, tips, tournament, Chittagong"
                  value={form.tags}
                  onChange={(e) => handleField("tags", e.target.value)}
                />
                {form.tags && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {form.tags.split(",").filter((t) => t.trim()).map((t) => (
                      <span key={t} style={{ padding: "3px 10px", background: "#EEF5F1", borderRadius: 99, fontSize: 12, color: "#006A4E", fontWeight: 500 }}>
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* action buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end", paddingBottom: 24 }}>
                <button className="btn-ghost" onClick={() => navigate("/member/dashboard")} disabled={saving}>
                  Cancel
                </button>
                <button className="btn-secondary" onClick={() => handleSubmit("draft")} disabled={saving}>
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button className="btn-primary" onClick={() => handleSubmit("published")} disabled={saving}>
                  {saving ? "Publishing…" : "🚀 Publish"}
                </button>
              </div>
            </div>
          )}

          {/* ── PREVIEW MODE ────────────────────────── */}
          {preview && (
            <div className="card" style={{ padding: "clamp(24px,5vw,48px)", animation: "fadeUp .3s ease" }}>
              {/* cover preview */}
              {coverPreview && (
                <div style={{ borderRadius: 14, overflow: "hidden", height: 320, marginBottom: 28 }}>
                  <img src={coverPreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              {/* meta */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", background: "rgba(0,106,78,.10)", color: "#006A4E" }}>
                  {form.category}
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {/* title */}
              <h1 className="fraunces" style={{ fontSize: "clamp(24px,4vw,38px)", color: "#111", margin: "0 0 16px", lineHeight: 1.2 }}>
                {form.title || <span style={{ color: "#ccc" }}>Your title here…</span>}
              </h1>
              {/* excerpt */}
              {form.excerpt && (
                <p style={{ fontSize: 17, color: "#666", lineHeight: 1.6, borderLeft: "3px solid #006A4E", paddingLeft: 16, margin: "0 0 24px", fontStyle: "italic" }}>
                  {form.excerpt}
                </p>
              )}
              <div style={{ height: 1, background: "rgba(180,140,80,.12)", marginBottom: 28 }} />
              {/* content */}
              <div className="prose">
                {form.content
                  ? form.content.split("\n\n").map((block, i) => {
                      if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
                      if (block.startsWith("# ")) return <h1 key={i}>{block.slice(2)}</h1>;
                      if (block.startsWith("### ")) return <h3 key={i}>{block.slice(4)}</h3>;
                      const parts = block.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                        part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part
                      );
                      return <p key={i}>{parts}</p>;
                    })
                  : <p style={{ color: "#ccc" }}>Your content will appear here…</p>}
              </div>
              {/* tags */}
              {form.tags && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(180,140,80,.12)" }}>
                  {form.tags.split(",").filter((t) => t.trim()).map((t) => (
                    <span key={t} style={{ padding: "4px 12px", background: "#EEF5F1", borderRadius: 99, fontSize: 12, color: "#006A4E", fontWeight: 500 }}>#{t.trim()}</span>
                  ))}
                </div>
              )}
              {/* back to edit */}
              <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
                <button className="btn-ghost" onClick={() => setPreview(false)}>← Back to Editor</button>
                <button className="btn-primary" onClick={() => handleSubmit("published")} disabled={saving}>
                  {saving ? "Publishing…" : "🚀 Publish"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}