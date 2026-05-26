import { useState, useEffect, useRef } from "react";
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
  padding: "20px",
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

const ROLES = ["member", "admin"];
const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  role: "member",
  bio: "",
  avatar_url: "",
};

function Avatar({ url, name, size = 44 }) {
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
        border: "2px solid rgba(0,106,78,0.15)",
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
        fontSize: size * 0.35,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        border: "2px solid rgba(0,106,78,0.15)",
      }}
    >
      {initials}
    </div>
  );
}

export default function ManageMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    async function checkAndFetch() {
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

      await fetchMembers();
    }
    checkAndFetch();
  }, [user, navigate]);

  async function fetchMembers() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, bio, avatar_url, created_at")
      .order("created_at", { ascending: false });

    if (!fetchError) setMembers(data || []);
    setLoading(false);
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (m.full_name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(member) {
    setEditId(member.id);
    setForm({
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "member",
      bio: member.bio || "",
      avatar_url: member.avatar_url || "",
    });
    setAvatarFile(null);
    setAvatarPreview(member.avatar_url || null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError("");
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for avatars.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  async function uploadAvatar(memberId) {
    if (!avatarFile) return form.avatar_url || null;

    setUploadProgress(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${memberId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadError) {
      setUploadProgress(false);
      throw new Error("Avatar upload failed: " + uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setUploadProgress(false);
    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim()) { setError("Full name is required."); return; }

    setSaving(true);
    setError("");

    try {
      let avatarUrl = form.avatar_url || null;

      if (editId) {
        // Upload avatar first (need member id)
        avatarUrl = await uploadAvatar(editId);

        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: form.full_name.trim(),
            phone: form.phone.trim() || null,
            role: form.role,
            bio: form.bio.trim() || null,
            avatar_url: avatarUrl,
          })
          .eq("id", editId);

        if (updateError) throw new Error(updateError.message);
      } else {
        // For new members: insert a row in users table
        // (normally created via auth trigger, but admin can pre-create profile)
        const tempId = crypto.randomUUID();
        avatarUrl = await uploadAvatar(tempId);

        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: tempId,
            full_name: form.full_name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            role: form.role,
            bio: form.bio.trim() || null,
            avatar_url: avatarUrl,
          });

        if (insertError) throw new Error(insertError.message);
      }

      setSuccess(editId ? "Member updated!" : "Member added!");
      closeForm();
      await fetchMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove ${name || "this member"} from the platform? This only removes the profile row.`)) return;
    setDeleting(id);

    const { error: delError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (!delError) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSuccess("Member removed.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(delError.message);
    }
    setDeleting(null);
  }

  async function handleRoleChange(member, newRole) {
    const { error: roleErr } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", member.id);

    if (!roleErr) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
    }
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  const adminCount = members.filter((m) => m.role === "admin").length;
  const memberCount = members.filter((m) => m.role === "member").length;

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
        .member-card { transition: box-shadow 0.2s; }
        .member-card:hover { box-shadow: 0 6px 28px rgba(180,140,80,0.18) !important; }
        .form-input:focus { border-color: #006A4E !important; }
        textarea.form-input { resize: vertical; min-height: 70px; }
        .primary-btn:hover { background: #005540 !important; }
        .danger-btn:hover { background: rgba(212,32,39,0.08) !important; }
        .edit-btn:hover { background: rgba(0,106,78,0.07) !important; }
        .avatar-upload-zone { transition: border-color 0.2s, background 0.2s; }
        .avatar-upload-zone:hover { border-color: #006A4E !important; background: rgba(0,106,78,0.04) !important; }
        .filter-chip { transition: all 0.15s; cursor: pointer; }
        .role-select { appearance: none; cursor: pointer; }
      `}</style>

      <div style={bgStyle}>
        {/* Header */}
        <div style={{ background: "#FFFDF9", borderBottom: "1px solid #EDE6D9", padding: "20px 20px 16px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <button
              onClick={() => navigate("/admin")}
              style={{ background: "none", border: "none", color: "#006A4E", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              ← Back to Dashboard
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "26px", margin: "0 0 4px", background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Members
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#888888" }}>
                  {members.length} total · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {memberCount} member{memberCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button className="primary-btn" style={primaryBtn} onClick={openCreate}>
                + Add Member
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>
          {/* Banners */}
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

          {/* Search + filter bar */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              className="form-input"
              style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
              type="text"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              {["all", "member", "admin"].map((r) => (
                <button
                  key={r}
                  className="filter-chip"
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: roleFilter === r ? "#006A4E" : "#E0D8CC",
                    background: roleFilter === r ? "rgba(0,106,78,0.08)" : "#FFFDF9",
                    color: roleFilter === r ? "#006A4E" : "#555555",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <div style={{ ...cardStyle, marginBottom: "24px", animation: "fadeSlideIn 0.3s ease" }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "18px", margin: "0 0 20px", color: "#111111" }}>
                {editId ? "Edit Member" : "Add Member"}
              </h2>

              {error && (
                <div style={{ background: "rgba(212,32,39,0.08)", border: "1px solid rgba(212,32,39,0.20)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#D42027", fontSize: "13px", fontWeight: "600" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Avatar upload */}
                <div>
                  <label style={labelStyle}>Avatar (max 2MB)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Avatar url={avatarPreview} name={form.full_name || "?"} size={56} />
                    <div
                      className="avatar-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        flex: 1,
                        border: "2px dashed #E0D8CC",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: "#FDFAF5",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "13px", color: "#888888" }}>
                        {avatarFile ? avatarFile.name : "Click to upload image"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#AAAAAA" }}>JPG, PNG, WEBP · max 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>

                {/* 2-col grid for name + role */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      className="form-input"
                      style={inputStyle}
                      type="text"
                      placeholder="e.g. Rahim Uddin"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Role</label>
                    <select
                      className="form-input role-select"
                      style={{ ...inputStyle }}
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email + phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      className="form-input"
                      style={{ ...inputStyle, opacity: editId ? 0.6 : 1 }}
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      disabled={!!editId}
                      title={editId ? "Email is set via auth and cannot be changed here" : ""}
                    />
                    {editId && <p style={{ fontSize: "11px", color: "#AAAAAA", margin: "4px 0 0" }}>Managed via Supabase Auth</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      className="form-input"
                      style={inputStyle}
                      type="tel"
                      placeholder="+880 1XXX XXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    className="form-input"
                    style={inputStyle}
                    placeholder="Short bio or description…"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                  <button type="button" style={ghostBtn} onClick={closeForm}>Cancel</button>
                  <button
                    type="submit"
                    className="primary-btn"
                    style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}
                    disabled={saving}
                  >
                    {saving ? (uploadProgress ? "Uploading…" : "Saving…") : editId ? "Update Member" : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members list */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#888888", fontSize: "14px" }}>
              Loading members…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>👥</div>
              <p style={{ color: "#888888", margin: 0, fontSize: "14px" }}>
                {search || roleFilter !== "all" ? "No members match your filters." : "No members yet."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="member-card"
                  style={{ ...cardStyle, animation: "fadeSlideIn 0.3s ease" }}
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <Avatar url={member.avatar_url} name={member.full_name} size={48} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + role badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "2px" }}>
                        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: "800", fontSize: "15px", color: "#111111" }}>
                          {member.full_name || "—"}
                        </span>
                        <span style={{
                          padding: "2px 9px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: member.role === "admin" ? "rgba(212,32,39,0.10)" : "rgba(0,106,78,0.09)",
                          color: member.role === "admin" ? "#D42027" : "#006A4E",
                        }}>
                          {member.role}
                        </span>
                      </div>

                      {/* Contact info */}
                      <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#555555" }}>
                        {member.email || <span style={{ color: "#AAAAAA" }}>No email</span>}
                        {member.phone && <span style={{ color: "#AAAAAA" }}> · {member.phone}</span>}
                      </p>

                      {member.bio && (
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888888", lineHeight: "1.4" }}>
                          {member.bio.length > 100 ? member.bio.slice(0, 100) + "…" : member.bio}
                        </p>
                      )}

                      <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#AAAAAA" }}>
                        Joined {formatDate(member.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Quick role toggle */}
                    <select
                      className="role-select"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value)}
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #E0D8CC",
                        borderRadius: "8px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#555555",
                        background: "#FFFDF9",
                        cursor: "pointer",
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>

                    <button className="edit-btn" style={editBtn} onClick={() => openEdit(member)}>
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      style={{ ...dangerBtn, opacity: deleting === member.id ? 0.6 : 1 }}
                      onClick={() => handleDelete(member.id, member.full_name)}
                      disabled={deleting === member.id}
                    >
                      {deleting === member.id ? "Removing…" : "Remove"}
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
