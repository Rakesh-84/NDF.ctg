import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const EMPTY = {
  title: "",
  content: "",
  priority: "low",
  is_pinned: false,
  is_active: true,
  link: "",
};

const PRIORITY_OPTS = [
  { value: "low",    label: "Info",   color: "#006A4E" },
  { value: "medium", label: "Notice", color: "#B87333" },
  { value: "high",   label: "Urgent", color: "#D42027" },
];

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function ManageAnnouncements() {
  const { user } = useAuth();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // null = new
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState("");
  const [search, setSearch]     = useState("");

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({
      title:     item.title || "",
      content:   item.content || "",
      priority:  item.priority || "low",
      is_pinned: item.is_pinned || false,
      is_active: item.is_active !== false,
      link:      item.link || "",
    });
    setShowForm(true);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);

    const payload = {
      title:     form.title.trim(),
      content:   form.content.trim(),
      priority:  form.priority,
      is_pinned: form.is_pinned,
      is_active: form.is_active,
      link:      form.link.trim() || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("announcements").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabase.from("announcements").insert({ ...payload, created_by: user.id }));
    }

    if (!error) {
      showToast(editing ? "Announcement updated." : "Announcement created.");
      setShowForm(false);
      fetchItems();
    } else {
      showToast("Error: " + error.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    setDeleting(id);
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) {
      showToast("Deleted.");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeleting(null);
  }

  async function toggleActive(item) {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
      showToast(item.is_active ? "Deactivated." : "Activated.");
    }
  }

  const filtered = items.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes bgBreathe {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% 0; }
          100% { background-position: 200% 0; }
        }

        .ma-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 100px;
        }
        .fraunces { font-family:'Fraunces',serif; }

        .wrap { max-width: 900px; margin: 0 auto; padding: 0 20px; }

        .card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 16px;
        }

        /* table row */
        .row-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(180,140,80,0.08);
          animation: fadeUp .3s ease both;
          transition: background .15s;
        }
        .row-item:last-child { border-bottom: none; }
        .row-item:hover { background: rgba(0,106,78,0.02); }

        /* badge */
        .badge {
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          display: inline-block;
        }

        /* buttons */
        .btn-primary {
          padding: 10px 22px;
          background: #006A4E;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background .18s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover:not(:disabled) { background: #004D38; }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        .btn-ghost {
          padding: 7px 14px;
          background: transparent;
          border: 1.5px solid rgba(180,140,80,.25);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #555;
          cursor: pointer;
          transition: all .15s;
        }
        .btn-ghost:hover { border-color: #006A4E; color: #006A4E; }

        .btn-danger {
          padding: 7px 14px;
          background: transparent;
          border: 1.5px solid rgba(212,32,39,.25);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #D42027;
          cursor: pointer;
          transition: all .15s;
        }
        .btn-danger:hover { background: rgba(212,32,39,.06); }
        .btn-danger:disabled { opacity: .5; cursor: not-allowed; }

        /* form fields */
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          padding: 11px 14px;
          background: #FDFAF6;
          border: 1.5px solid rgba(180,140,80,.22);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .field-input:focus {
          border-color: #006A4E;
          box-shadow: 0 0 0 3px rgba(0,106,78,.08);
        }
        textarea.field-input { resize: vertical; min-height: 110px; line-height: 1.6; }
        select.field-input { appearance: none; cursor: pointer; }

        /* modal overlay */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal {
          background: #FFFDF9;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn .25s ease;
        }

        /* toggle */
        .toggle {
          width: 40px;
          height: 22px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: background .2s;
          position: relative;
          flex-shrink: 0;
        }
        .toggle::after {
          content: '';
          position: absolute;
          top: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          transition: left .2s;
        }
        .toggle.on  { background: #006A4E; }
        .toggle.on::after  { left: 21px; }
        .toggle.off { background: #ddd; }
        .toggle.off::after { left: 3px; }

        /* search */
        .search-box {
          padding: 10px 14px 10px 38px;
          background: #FFFDF9;
          border: 1.5px solid rgba(180,140,80,.22);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          width: 240px;
          transition: border-color .2s;
        }
        .search-box:focus { border-color: #006A4E; }

        /* toast */
        .toast {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: #1A3A2A;
          color: #fff;
          padding: 12px 24px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 500;
          z-index: 200;
          animation: fadeUp .3s ease;
          white-space: nowrap;
        }

        /* skeleton */
        .sk {
          background: linear-gradient(90deg,#f0ebe3 25%,#faf6f0 50%,#f0ebe3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }

        /* stat cards */
        .stat-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 4px 20px rgba(180,140,80,.10);
          border-radius: 14px;
          padding: 20px;
          text-align: center;
          flex: 1;
        }
      `}</style>

      <div className="ma-root">
        <div className="wrap">

          {/* ── HEADER ─────────────────────────────── */}
          <div style={{ padding: "clamp(28px,5vw,52px) 0 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, animation: "fadeUp .4s ease" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#006A4E", margin: "0 0 6px" }}>Admin</p>
              <h1 className="fraunces" style={{ fontSize: "clamp(24px,4vw,36px)", color: "#111", margin: 0 }}>Manage Announcements</h1>
            </div>
            <button className="btn-primary" onClick={openNew}>+ New Announcement</button>
          </div>

          {/* ── STATS ──────────────────────────────── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: items.length, color: "#111" },
              { label: "Active", value: items.filter((i) => i.is_active).length, color: "#006A4E" },
              { label: "Urgent", value: items.filter((i) => i.priority === "high").length, color: "#D42027" },
              { label: "Pinned", value: items.filter((i) => i.is_pinned).length, color: "#B87333" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fraunces',serif", color: s.color, margin: "0 0 4px" }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── SEARCH ─────────────────────────────── */}
          <div style={{ marginBottom: 16, position: "relative", display: "inline-block" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 15 }}>🔍</span>
            <input
              className="search-box"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ── LIST ───────────────────────────────── */}
          <div className="card">
            {loading && (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{ padding: "18px 20px", borderBottom: "1px solid rgba(180,140,80,.08)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <div className="sk" style={{ width: 55, height: 20 }} />
                    <div className="sk" style={{ width: 90, height: 14 }} />
                  </div>
                  <div className="sk" style={{ height: 16, width: "65%" }} />
                </div>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "#888" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ fontSize: 16, fontWeight: 500, color: "#555", margin: 0 }}>No announcements yet</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Click "+ New Announcement" to create one.</p>
              </div>
            )}

            {!loading && filtered.map((item, i) => {
              const p = PRIORITY_OPTS.find((o) => o.value === item.priority) || PRIORITY_OPTS[0];
              return (
                <div key={item.id} className="row-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span className="badge" style={{ background: `rgba(${p.color === "#D42027" ? "212,32,39" : p.color === "#B87333" ? "184,115,51" : "0,106,78"},.10)`, color: p.color }}>
                        {p.label}
                      </span>
                      {item.is_pinned && <span className="badge" style={{ background: "rgba(0,106,78,.08)", color: "#006A4E" }}>📌 Pinned</span>}
                      {!item.is_active && <span className="badge" style={{ background: "rgba(0,0,0,.06)", color: "#888" }}>Inactive</span>}
                      <span style={{ fontSize: 12, color: "#aaa" }}>{fmt(item.created_at)}</span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#111", fontFamily: "'Fraunces',serif" }}>{item.title}</p>
                    {item.content && (
                      <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                        {item.content.slice(0, 100)}{item.content.length > 100 ? "…" : ""}
                      </p>
                    )}
                  </div>
                  {/* actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button
                      className={`toggle ${item.is_active ? "on" : "off"}`}
                      onClick={() => toggleActive(item)}
                      title={item.is_active ? "Deactivate" : "Activate"}
                    />
                    <button className="btn-ghost" onClick={() => openEdit(item)}>Edit</button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── MODAL FORM ─────────────────────────────── */}
      {showForm && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ padding: "28px 28px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 className="fraunces" style={{ fontSize: 22, color: "#111", margin: 0 }}>
                  {editing ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", padding: "4px 8px" }}
                >✕</button>
              </div>
            </div>

            <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* title */}
              <div>
                <label className="field-label">Title *</label>
                <input
                  className="field-input"
                  placeholder="Announcement title…"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* content */}
              <div>
                <label className="field-label">Content</label>
                <textarea
                  className="field-input"
                  placeholder="Full announcement text…"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              </div>

              {/* priority + pinned row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Priority</label>
                  <select
                    className="field-input"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    {PRIORITY_OPTS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Status</label>
                  <select
                    className="field-input"
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* link */}
              <div>
                <label className="field-label">Link (optional)</label>
                <input
                  className="field-input"
                  placeholder="https://…"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                />
              </div>

              {/* pinned toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(0,106,78,.04)", borderRadius: 10, border: "1px solid rgba(0,106,78,.10)" }}>
                <button
                  type="button"
                  className={`toggle ${form.is_pinned ? "on" : "off"}`}
                  onClick={() => setForm((f) => ({ ...f, is_pinned: !f.is_pinned }))}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>Pin to top</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Pinned items appear first on the public page.</p>
                </div>
              </div>

              {/* actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}