import { useState } from "react";

const SOCIALS = [
  { icon: "📘", label: "Facebook", handle: "@ndfctg", href: "https://facebook.com/ndfctg" },
  { icon: "📸", label: "Instagram", handle: "@ndfctg", href: "https://instagram.com/ndfctg" },
  { icon: "▶️", label: "YouTube", handle: "NDFCTG Official", href: "https://youtube.com/@ndfctg" },
  { icon: "💬", label: "WhatsApp Group", handle: "Join Community", href: "#" },
];

const FAQS = [
  {
    q: "Do I need prior experience to join?",
    a: "Not at all! We welcome complete beginners. Our training programme starts from the fundamentals and builds up.",
  },
  {
    q: "Is there a membership fee?",
    a: "There is a nominal annual fee that covers training materials and event participation. Contact us for current rates.",
  },
  {
    q: "What debate formats do you train in?",
    a: "We primarily train in British Parliamentary (BP), Asian Parliamentary, and Lincoln-Douglas formats.",
  },
  {
    q: "How often do you meet?",
    a: "We hold practice sessions twice a week — typically Thursday evenings and Saturday afternoons.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(null);

  function handleChange(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // mailto fallback — replace with your preferred form handler (Formspree, EmailJS, etc.)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || "Message from NDFCTG Website");
    window.location.href = `mailto:info@ndfctg.org?subject=${subject}&body=${body}`;
    setSent(true);
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
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }

        .contact-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 100px;
          color: #111;
        }
        .fraunces { font-family:'Fraunces',serif; }
        .fraunces-i { font-family:'Fraunces',serif; font-style:italic; }

        .card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 18px;
        }

        .wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* hero */
        .hero {
          text-align: center;
          padding: clamp(44px,8vw,80px) 20px clamp(28px,5vw,56px);
          animation: fadeUp .5s ease both;
        }

        /* form */
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
          padding: 12px 14px;
          background: #FDFAF6;
          border: 1.5px solid rgba(180,140,80,0.22);
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
        textarea.field-input { resize: vertical; min-height: 130px; line-height: 1.6; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #006A4E;
          color: #fff;
          border: none;
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background .18s, transform .18s;
          margin-top: 4px;
        }
        .submit-btn:hover { background: #004D38; transform: translateY(-1px); }

        /* info cards */
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(180,140,80,.10);
        }
        .info-item:last-child { border-bottom: none; }
        .info-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(0,106,78,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        /* social */
        .social-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 12px;
          text-decoration: none;
          color: #111;
          transition: transform .2s, box-shadow .2s;
          font-size: 14px;
          font-weight: 500;
        }
        .social-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(180,140,80,0.18); }

        /* FAQ */
        .faq-item {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
          animation: fadeUp .4s ease both;
        }
        .faq-q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          text-align: left;
          gap: 12px;
        }
        .faq-a {
          padding: 0 22px 18px;
          font-size: 14px;
          color: #555;
          line-height: 1.7;
        }

        /* success */
        .success-box {
          text-align: center;
          padding: 48px 32px;
          animation: fadeUp .4s ease;
        }

        /* map placeholder */
        .map-placeholder {
          background: linear-gradient(135deg,#EEF5F1,#F0F7F4);
          border-radius: 16px;
          height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #888;
          font-size: 14px;
        }
      `}</style>

      <div className="contact-root">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="hero">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#006A4E", marginBottom: 10 }}>
            Get In Touch
          </p>
          <h1
            className="fraunces"
            style={{
              fontSize: "clamp(32px,6vw,56px)",
              background: "linear-gradient(135deg,#006A4E 0%,#1A3A2A 60%,#004D38 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.15,
              margin: "0 0 16px",
            }}
          >
            We'd Love to Hear<br />
            <span className="fraunces-i">From You.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Have a question, want to join, or interested in partnering with us?
            Reach out — we respond within 24 hours.
          </p>
        </div>

        {/* ── MAIN GRID ────────────────────────────────── */}
        <div className="wrap" style={{ marginBottom: 56 }}>
         <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "stretch" }}>

            {/* ── LEFT: info + socials ─────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* contact info */}
              <div className="card" style={{ padding: "28px 24px" }}>
                <h2 className="fraunces" style={{ fontSize: 20, color: "#111", margin: "0 0 20px" }}>Contact Info</h2>
                {[
                  { icon: "📍", label: "Address", value: "GEC Circle, Chittagong, Bangladesh" },
                  { icon: "📧", label: "Email", value: "info@ndfctg.org", href: "mailto:info@ndfctg.org" },
                  { icon: "📞", label: "Phone", value: "+880 1XXX-XXXXXX", href: "tel:+8801XXXXXXXXX" },
                  { icon: "🕐", label: "Office Hours", value: "Sun–Thu, 10am – 6pm" },
                ].map((item) => (
                  <div key={item.label} className="info-item">
                    <div className="info-icon">{item.icon}</div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 3px" }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} style={{ fontSize: 14, color: "#111", fontWeight: 500, textDecoration: "none" }}>{item.value}</a>
                      ) : (
                        <p style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* socials */}
              <div className="card" style={{ padding: "28px 24px" }}>
                <h2 className="fraunces" style={{ fontSize: 20, color: "#111", margin: "0 0 18px" }}>Follow Us</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SOCIALS.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-btn">
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{s.handle}</p>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#ccc", fontSize: 14 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* map placeholder */}
              <div className="card" style={{ padding: 16 }}>
                <div className="map-placeholder">
                  <span style={{ fontSize: 36 }}>🗺️</span>
                  <p style={{ margin: 0, fontWeight: 500 }}>GEC Circle, Chittagong</p>
                  <a
                    href="https://maps.google.com/?q=GEC+Circle+Chittagong"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 13, color: "#006A4E", fontWeight: 600, textDecoration: "none" }}
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

            </div>

            {/* ── RIGHT: contact form ───────────────────── */}
            <div className="card" style={{ padding: "clamp(24px,4vw,40px)" }}>
              {sent ? (
                <div className="success-box">
                  <div style={{ fontSize: 52, marginBottom: 16, animation: "pulse 1s ease 2" }}>✉️</div>
                  <h3 className="fraunces" style={{ fontSize: 26, color: "#111", margin: "0 0 10px" }}>Message Sent!</h3>
                  <p style={{ color: "#555", fontSize: 15, lineHeight: 1.65 }}>
                    Your email client should have opened. If not, email us directly at{" "}
                    <a href="mailto:info@ndfctg.org" style={{ color: "#006A4E", fontWeight: 600 }}>info@ndfctg.org</a>.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    style={{ marginTop: 20, padding: "10px 24px", background: "#EEF5F1", color: "#006A4E", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="fraunces" style={{ fontSize: 22, color: "#111", margin: "0 0 24px" }}>Send a Message</h2>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label className="field-label">Your Name *</label>
                        <input
                          className="field-input"
                          required
                          placeholder="Farhan Hossain"
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label">Email Address *</label>
                        <input
                          className="field-input"
                          type="email"
                          required
                          placeholder="you@email.com"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">Subject</label>
                      <input
                        className="field-input"
                        placeholder="Membership enquiry / Event question…"
                        value={form.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="field-label">Message *</label>
                      <textarea
                        className="field-input"
                        required
                        placeholder="Tell us what's on your mind…"
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                      />
                    </div>

                    {/* enquiry type quick-select */}
                    <div>
                      <label className="field-label">I'm enquiring about…</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["Membership", "Events", "Training", "Partnership", "Other"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleChange("subject", t)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 99,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: "pointer",
                              border: "1.5px solid",
                              fontFamily: "'DM Sans',sans-serif",
                              transition: "all .15s",
                              borderColor: form.subject === t ? "#006A4E" : "rgba(180,140,80,.22)",
                              background: form.subject === t ? "#006A4E" : "transparent",
                              color: form.subject === t ? "#fff" : "#555",
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">
                      Send Message →
                    </button>

                    <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", margin: 0 }}>
                      We'll get back to you within 24 hours.
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────── */}
        <div className="wrap">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#006A4E", marginBottom: 10 }}>FAQ</p>
          <h2 className="fraunces" style={{ fontSize: "clamp(22px,3.5vw,32px)", color: "#111", margin: "0 0 24px" }}>Common Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item" style={{ animationDelay: `${i * 0.07}s` }}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 18, color: "#006A4E", flexShrink: 0, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {open === i && (
                <div className="faq-a">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}