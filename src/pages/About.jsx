export default function About() {
  const pillars = [
    {
      icon: "🎙️",
      title: "Oratory Excellence",
      desc: "We train members in structured argumentation, rhetoric, and the art of persuasive public speaking across multiple debate formats.",
    },
    {
      icon: "🤝",
      title: "Community First",
      desc: "Built on camaraderie and mutual growth. Every member — from first-timer to champion — belongs here and is supported equally.",
    },
    {
      icon: "🏆",
      title: "Competitive Edge",
      desc: "We compete at divisional, national, and international tournaments, consistently representing Chittagong with pride.",
    },
    {
      icon: "📚",
      title: "Intellectual Growth",
      desc: "Debates sharpen critical thinking, research skills, and the ability to see every issue from multiple perspectives.",
    },
  ];

  const timeline = [
    { year: "2010", event: "Founded by a group of university students passionate about structured debate." },
    { year: "2013", event: "First national tournament participation — reaching the semifinals." },
    { year: "2016", event: "Launched our youth outreach program for school-level debaters." },
    { year: "2019", event: "Hosted the first Chittagong Inter-University Debate Championship." },
    { year: "2022", event: "Crossed 500 active members; introduced online training sessions." },
    { year: "2024", event: "Expanded to international circuits including WUDC qualifiers." },
  ];

  const team = [
    { name: "Jewel Chowdhury", role: "President", initial: "J" },
    { name: "Nusrat Jahan", role: "Vice President", initial: "N" },
    { name: "Arif Chowdhury", role: "Training Coordinator", initial: "A" },
    { name: "Maliha Rahman", role: "Events Director", initial: "M" },
    { name: "Tahmid Islam", role: "Secretary", initial: "T" },
    { name: "Priya Das", role: "Treasurer", initial: "P" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;1,400;1,800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes bgBreathe {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lineGrow {
          from { height: 0; }
          to   { height: 100%; }
        }

        .about-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg,#FDF8F2,#F5EFE6,#EEF5F1,#FAF3E8,#F0F7F4);
          background-size: 300% 300%;
          animation: bgBreathe 14s ease infinite;
          padding-bottom: 100px;
          color: #111;
        }
        .fraunces { font-family: 'Fraunces', serif; }
        .fraunces-italic { font-family: 'Fraunces', serif; font-style: italic; }

        .card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 18px;
        }

        /* hero */
        .hero-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: clamp(40px,8vw,80px) 20px clamp(32px,6vw,60px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          animation: fadeUp .6s ease both;
        }
        @media (max-width: 700px) {
          .hero-section { grid-template-columns: 1fr; gap: 28px; }
          .hero-visual { display: none; }
        }

        /* decorative quote block */
        .quote-block {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 20px;
          padding: 36px 32px;
          position: relative;
          overflow: hidden;
        }
        .quote-block::before {
          content: '"';
          font-family: 'Fraunces', serif;
          font-size: 120px;
          color: rgba(0,106,78,0.08);
          position: absolute;
          top: -10px;
          left: 16px;
          line-height: 1;
        }

        /* section wrapper */
        .section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
          margin-bottom: 64px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #006A4E;
          margin-bottom: 10px;
        }
        .section-title {
          font-size: clamp(24px, 4vw, 36px);
          color: #111;
          margin: 0 0 32px;
          line-height: 1.2;
        }

        /* pillars grid */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
        }
        .pillar-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 16px;
          padding: 28px 24px;
          transition: transform .22s, box-shadow .22s;
          animation: fadeUp .4s ease both;
        }
        .pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(180,140,80,0.18);
        }

        /* timeline */
        .timeline {
          position: relative;
          padding-left: 28px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom, #006A4E, rgba(0,106,78,0.1));
          border-radius: 2px;
        }
        .tl-item {
          position: relative;
          margin-bottom: 28px;
          animation: fadeUp .4s ease both;
        }
        .tl-dot {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #006A4E;
          border: 3px solid #F5EFE6;
          box-shadow: 0 0 0 2px rgba(0,106,78,0.2);
        }
        .tl-year {
          font-size: 12px;
          font-weight: 700;
          color: #006A4E;
          letter-spacing: .06em;
          margin-bottom: 4px;
        }
        .tl-text {
          font-size: 15px;
          color: #444;
          line-height: 1.6;
        }

        /* team grid */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 18px;
        }
        .team-card {
          background: #FFFDF9;
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(180,140,80,0.10);
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          transition: transform .2s;
          animation: fadeUp .4s ease both;
        }
        .team-card:hover { transform: translateY(-3px); }
        .team-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006A4E, #1A3A2A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin: 0 auto 14px;
          font-family: 'Fraunces', serif;
        }

        /* stat band */
        .stat-band {
          background: linear-gradient(135deg, #006A4E, #1A3A2A);
          border-radius: 20px;
          padding: 40px 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 24px;
          text-align: center;
          margin-bottom: 64px;
        }
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: 40px;
          color: #fff;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-lbl {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
        }

        /* divider */
        .divider {
          height: 1px;
          background: rgba(180,140,80,0.12);
          margin: 48px 0;
        }
      `}</style>

      <div className="about-root">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="hero-section">
          <div>
            <p className="section-label">Est. 2010 · Chittagong, Bangladesh</p>
            <h1
              className="fraunces"
              style={{
                fontSize: "clamp(34px,6vw,58px)",
                lineHeight: 1.12,
                background: "linear-gradient(135deg,#006A4E 0%,#1A3A2A 60%,#004D38 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 20px",
              }}
            >
              Where Words<br />
              <span className="fraunces-italic">Shape Leaders.</span>
            </h1>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.75, maxWidth: 440, margin: "0 0 28px" }}>
              The North & South Debate Club of Chittagong (NDFCTG) has been nurturing
              the next generation of critical thinkers, communicators, and leaders
              since 2010. We believe every great idea deserves a great voice.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="/events"
                style={{
                  padding: "12px 24px",
                  background: "#006A4E",
                  color: "#fff",
                  borderRadius: 11,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "background .18s",
                }}
              >
                Upcoming Events →
              </a>
              <a
                href="/contact"
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#006A4E",
                  border: "1.5px solid #006A4E",
                  borderRadius: 11,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Get in Touch
              </a>
            </div>
          </div>

          {/* decorative quote */}
          <div className="hero-visual quote-block">
            <p
              className="fraunces-italic"
              style={{ fontSize: "clamp(18px,2.5vw,24px)", color: "#1A3A2A", lineHeight: 1.5, margin: "0 0 20px", position: "relative", zIndex: 1 }}
            >
              "The art of debate is not to win an argument — it is to discover truth together."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#006A4E,#1A3A2A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Fraunces',serif" }}>F</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>Jewel Chowdhury</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>President</p>
              </div>
            </div>
            {/* decorative dots */}
            <div style={{ position: "absolute", bottom: 20, right: 20, display: "grid", gridTemplateColumns: "repeat(4,8px)", gap: 6 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(0,106,78,0.15)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS BAND ───────────────────────────────── */}
        <div className="section">
          <div className="stat-band">
            {[
              { n: "500+", l: "Active Members" },
              { n: "14", l: "Years Running" },
              { n: "80+", l: "Tournaments" },
              { n: "12", l: "National Titles" },
            ].map((s) => (
              <div key={s.l}>
                <div className="stat-num">{s.n}</div>
                <div className="stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PILLARS ──────────────────────────────────── */}
        <div className="section">
          <p className="section-label">What We Stand For</p>
          <h2 className="fraunces section-title">Our Core Pillars</h2>
          <div className="pillars-grid">
            {pillars.map((p, i) => (
              <div key={p.title} className="pillar-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
                <h3 className="fraunces" style={{ fontSize: 18, color: "#111", margin: "0 0 10px" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MISSION / VISION ─────────────────────────── */}
        <div className="section">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                label: "Our Mission",
                icon: "🎯",
                text: "To foster a culture of intellectual curiosity and respectful discourse in Chittagong by providing world-class debate training, accessible to students from all backgrounds.",
                accent: "#006A4E",
              },
              {
                label: "Our Vision",
                icon: "🌟",
                text: "A Bangladesh where every young person has the confidence to articulate ideas, challenge assumptions, and contribute meaningfully to civic life — starting here in Chittagong.",
                accent: "#D42027",
              },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "32px 28px" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: item.accent, margin: "0 0 10px" }}>{item.label}</p>
                <p style={{ fontSize: 15, color: "#444", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIMELINE ─────────────────────────────────── */}
        <div className="section">
          <p className="section-label">Our Journey</p>
          <h2 className="fraunces section-title">A Decade of Debate</h2>
          <div style={{ maxWidth: 600 }}>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={t.year} className="tl-item" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="tl-dot" />
                  <p className="tl-year">{t.year}</p>
                  <p className="tl-text">{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TEAM ─────────────────────────────────────── */}
        <div className="section">
          <p className="section-label">The People Behind It</p>
          <h2 className="fraunces section-title">Current Leadership</h2>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={m.name} className="team-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="team-avatar">{m.initial}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 4px" }}>{m.name}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── JOIN CTA ──────────────────────────────────── */}
        <div className="section">
          <div
            className="card"
            style={{
              padding: "clamp(32px,6vw,56px)",
              textAlign: "center",
              background: "linear-gradient(135deg,rgba(0,106,78,0.04),rgba(238,245,241,0.8))",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#006A4E", marginBottom: 12 }}>Join Us</p>
            <h2 className="fraunces" style={{ fontSize: "clamp(24px,4vw,38px)", color: "#111", margin: "0 0 16px", lineHeight: 1.2 }}>
              Ready to Find Your Voice?
            </h2>
            <p style={{ fontSize: 16, color: "#555", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>
              Whether you're a seasoned debater or stepping onto the floor for the first time — NDFCTG is your home.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/signup"
                style={{ padding: "13px 28px", background: "#006A4E", color: "#fff", borderRadius: 11, textDecoration: "none", fontSize: 15, fontWeight: 600 }}
              >
                Become a Member
              </a>
              <a
                href="/contact"
                style={{ padding: "13px 24px", background: "transparent", color: "#006A4E", border: "1.5px solid #006A4E", borderRadius: 11, textDecoration: "none", fontSize: 15, fontWeight: 600 }}
              >
                Ask Us Anything
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}