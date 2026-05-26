import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../../components/Breadcrumb";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("full_name, phone, bio, avatar_url, email")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || "");
          setEmail(data.email || user.email || "");
        }
      } catch {
        setError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
    } catch {
      setError("Avatar upload failed. Try again.");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#888888", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            Loading profile…
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
        paddingBottom: 100,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bgBreathe {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ep-input:focus {
          outline: none;
          border-color: #006A4E !important;
          box-shadow: 0 0 0 3px rgba(0,106,78,0.10) !important;
        }
        .ep-input:disabled {
          background: #F5F0E8 !important;
          color: #888888 !important;
          cursor: not-allowed;
        }
        .ep-avatar-ring:hover .ep-avatar-overlay {
          opacity: 1 !important;
        }
        .ep-save-btn:hover:not(:disabled) {
          background: #005540 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,106,78,0.25) !important;
        }
        .ep-save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
        {/* Breadcrumb */}
        <div style={{ paddingTop: 20 }}>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/member/dashboard" },
              { label: "Edit Profile" },
            ]}
          />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both" }}>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: "clamp(26px, 6vw, 34px)",
              background: "linear-gradient(135deg, #006A4E 0%, #1A3A2A 60%, #004D38 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 6px",
              lineHeight: 1.15,
            }}
          >
            Edit Profile
          </h1>
          <p style={{ color: "#888888", fontSize: 14, margin: 0 }}>
            Update your personal details and avatar
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
            <span style={{ fontSize: 16 }}>⚠️</span> {error}
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
            <span style={{ fontSize: 16 }}>✅</span> Profile saved successfully!
          </div>
        )}

        {/* Main card */}
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(255,255,255,0.95)",
            borderRadius: 18,
            boxShadow: "0 4px 20px rgba(180,140,80,0.10)",
            padding: "28px 24px",
            animation: "fadeUp 0.45s ease 0.05s both",
          }}
        >
          {/* Avatar section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <div
              className="ep-avatar-ring"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: "3px solid #E8D5B0",
                  overflow: "hidden",
                  background: displayAvatar ? "transparent" : "linear-gradient(135deg, #006A4E, #004D38)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 800,
                      fontSize: 32,
                      color: "#FFFDF9",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>

              {/* Hover overlay */}
              <div
                className="ep-avatar-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: uploading ? 1 : 0,
                  transition: "opacity 0.2s ease",
                }}
              >
                {uploading ? (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                )}
              </div>
            </div>

            <p style={{ color: "#888888", fontSize: 12, marginTop: 10, marginBottom: 0 }}>
              {uploading ? "Uploading…" : "Tap to change · Max 2MB"}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            {/* Email (read-only) */}
            <div style={{ marginBottom: 20 }}>
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
                Email
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    fontWeight: 400,
                    color: "#AAAAAA",
                    background: "#F0EBE0",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  read-only
                </span>
              </label>
              <input
                className="ep-input"
                type="email"
                value={email}
                disabled
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1px solid #E8D5B0",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#888888",
                  background: "#F5F0E8",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
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
                Full Name <span style={{ color: "#D42027" }}>*</span>
              </label>
              <input
                className="ep-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1px solid #E8D5B0",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#111111",
                  background: "#FFFDF9",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 20 }}>
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
                Phone
              </label>
              <input
                className="ep-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1X XX XXX XXX"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1px solid #E8D5B0",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#111111",
                  background: "#FFFDF9",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 28 }}>
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
                Bio
              </label>
              <textarea
                className="ep-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself…"
                rows={4}
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
              <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 5, marginBottom: 0 }}>
                {bio.length} / 500 characters
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="ep-save-btn"
                disabled={saving || uploading}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "13px 24px",
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
                  "Save Changes"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/member/dashboard")}
                style={{
                  padding: "13px 20px",
                  background: "transparent",
                  color: "#888888",
                  border: "1px solid #E8D5B0",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#006A4E";
                  e.currentTarget.style.color = "#006A4E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E8D5B0";
                  e.currentTarget.style.color = "#888888";
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}