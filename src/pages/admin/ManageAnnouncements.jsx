import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
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
  padding: "24px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E0D8CC",
  borderRadius: "10px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "#111111",
  background: "#FFFDF9",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#555555",
  marginBottom: "6px",
};

const primaryBtn = {
  background: "#006A4E",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 22px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "background 0.2s",
};

const ghostBtn = {
  background: "transparent",
  color: "#555555",
  border: "1px solid #E0D8CC",
  borderRadius: "10px",
  padding: "10px 18px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "500",
  fontSize: "14px",
  cursor: "pointer",
};

const dangerBtn = {
  background: "transparent",
  color: "#D42027",
  border: "1px solid #D42027",
  borderRadius: "8px",
  padding: "6px 14px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
};

const editBtn = {
  background: "transparent",
  color: "#006A4E",
  border: "1px solid #006A4E",
  borderRadius: "8px",
  padding: "6px 14px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
};

const pinToggleStyle = (isPinned) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  border: "none",
  background: isPinned ? "rgba(212,32,39,0.10)" : "rgba(0,0,0,0.06)",
  color: isPinned ? "#D42027" : "#888888",
  transition: "all 0.2s",
});

const EMPTY_FORM = { title: "", body: "", is_pinned: false, published_at: "" };

export default function ManageAnnouncements() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        navigate("/");
        return;
      }

      await fetchAnnouncements();
    }
    checkAdminAndFetch();
  }, [user, navigate]);

  async function fetchAnnouncements() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });

    if (!fetchError) setAnnouncements(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, published_at: new Date().toISOString().slice(0, 16) });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(ann) {
    setEditId(ann.id);
    setForm({
      title: ann.title || "",
      body: ann.body || "",
      is_pinned: ann.is_pinned || false,
      published_at: ann.published_at ? ann.published_at.slice(0, 16) : "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.body.trim()) { setError("Body is required."); return; }

    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      is_pinned: form.is_pinned,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
    };

    let result;
    if (editId) {
      result = await supabase
        .from("announcements")
        .update(payload)
        .eq("id", editId);
    } else {
      result = await supabase
        .from("announcements")
        .insert({ ...payload, created_by: user.id });
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSuccess(editId ? "Announcement updated!" : "Announcement created!");
    setSaving(false);
    closeForm();
    await fetchAnnouncements();
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setDeleting(id);
    const { error: delError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (!delError) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Announcement deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(delError.message);
    }
    setDeleting(null);
  }

  async function handleTogglePin(ann) {
    const { error: toggleError } = await supabase
      .from("announcements")
      .update({ is_pinned: !ann.is_pinned })
      .eq("id", ann.id);

    if (!toggleError) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === ann.id ? { ...a, is_pinned: !a.is_pinned } : a
        ).sort((a, b) => {
          if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
          return new Date(b.published_at) - new Date(a.published_at);
        })
      );
    }
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
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ann-card:hover { box-shadow: 0 6px 28px rgba(180,140,80,0.18) !important; }
        .form-input:focus { border-color: #006A4E !important; }
        textarea.form-input { resize: vertical; min-height: 90px; }
        .primary-btn:hover { background: #005540 !important; }
        .danger-btn:hover { background: rgba(212,32,39,0.08) !important; }
        .edit-btn:hover { background: rgba(0,106,78,0.07) !important; }
      `}</style>

      <div style={bgStyle}>
        {/* Header */}
        <div style={{ background: "#FFFDF9", borderBottom: "1px solid #EDE6D9", padding: "20px 20px 16px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <button
              onClick={() => navigate("/admin")}
              style={{ background: "none", border: "none", color: "#006A4E", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              ← Back to Dashboard
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "26px", margin: "0 0 4px", background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Announcements
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#888888" }}>
                  {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button className="primary-btn" style={primaryBtn} onClick={openCreate}>
                + New Announcement
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
          {/* Success / Error banners */}
          {success && (
            <div style={{ background: "rgba(0,106,78,0.09)", border: "1px solid rgba(0,106,78,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#006A4E", fontWeight: "600", fontSize: "14px", animation: "fadeSlideIn 0.3s ease" }}>
              ✓ {success}
            </div>
          )}
          {error && !showForm && (
            <div style={{ background: "rgba(212,32,39,0.08)", border: "1px solid rgba(212,32,39,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#D42027", fontWeight: "600", fontSize: "14px" }}>
              {error}
            </div>
          )}

          {/* Create / Edit Form */}
          {showForm && (
            <div style={{ ...cardStyle, marginBottom: "24px", animation: "fadeSlideIn 0.3s ease" }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "18px", margin: "0 0 20px", color: "#111111" }}>
                {editId ? "Edit Announcement" : "New Announcement"}
              </h2>

              {error && (
                <div style={{ background: "rgba(212,32,39,0.08)", border: "1px solid rgba(212,32,39,0.20)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#D42027", fontSize: "13px", fontWeight: "600" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Title */}
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    className="form-input"
                    style={inputStyle}
                    type="text"
                    placeholder="Announcement title…"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    maxLength={200}
                  />
                </div>

                {/* Body */}
                <div>
                  <label style={labelStyle}>Body *</label>
                  <textarea
                    className="form-input"
                    style={inputStyle}
                    placeholder="Write the announcement content…"
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={5}
                  />
                </div>

                {/* Published At */}
                <div>
                  <label style={labelStyle}>Publish Date & Time</label>
                  <input
                    className="form-input"
                    style={inputStyle}
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                  />
                </div>

                {/* Pin toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={form.is_pinned}
                    onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#D42027", cursor: "pointer" }}
                  />
                  <label htmlFor="is_pinned" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
                    Pin this announcement (shows at top)
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                  <button type="button" style={ghostBtn} onClick={closeForm}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : editId ? "Update" : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Announcements List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#888888", fontSize: "14px" }}>
              Loading announcements…
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📢</div>
              <p style={{ color: "#888888", margin: 0, fontSize: "14px" }}>No announcements yet. Create your first one!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="ann-card"
                  style={{
                    ...cardStyle,
                    transition: "box-shadow 0.2s",
                    animation: "fadeSlideIn 0.3s ease",
                    borderLeft: ann.is_pinned ? "3px solid #D42027" : "3px solid transparent",
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "16px", margin: 0, color: "#111111", wordBreak: "break-word" }}>
                          {ann.title}
                        </h3>
                        {ann.is_pinned && (
                          <span style={{ background: "rgba(212,32,39,0.10)", color: "#D42027", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#888888", fontSize: "12px", margin: "0 0 8px" }}>
                        {formatDate(ann.published_at)}
                      </p>
                      <p style={{ color: "#555555", fontSize: "14px", margin: 0, lineHeight: "1.55", wordBreak: "break-word" }}>
                        {ann.body.length > 180 ? ann.body.slice(0, 180) + "…" : ann.body}
                      </p>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      style={pinToggleStyle(ann.is_pinned)}
                      onClick={() => handleTogglePin(ann)}
                      title={ann.is_pinned ? "Unpin" : "Pin"}
                    >
                      📌 {ann.is_pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      className="edit-btn"
                      style={editBtn}
                      onClick={() => openEdit(ann)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      style={{ ...dangerBtn, opacity: deleting === ann.id ? 0.6 : 1 }}
                      onClick={() => handleDelete(ann.id)}
                      disabled={deleting === ann.id}
                    >
                      {deleting === ann.id ? "Deleting…" : "Delete"}
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