import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleAuth = (tab) => {
    navigate(`/auth?tab=${tab}`);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F4EF", color: "#3D2B1F", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --cream: #F7F4EF;
          --cream-dark: #EDE9E0;
          --soil: #3D2B1F;
          --soil-mid: #6B4C38;
          --soil-light: #A07858;
          --leaf: #2D5016;
          --leaf-mid: #4A7C2F;
          --leaf-bright: #6BA033;
          --harvest: #C4730A;
          --harvest-light: #F0A030;
          --sky: #1A3A5C;
          --mist: #D4CFC7;
          --white: #FFFFFF;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .gramos-nav {
          position: fixed; top: 0; width: 100%; z-index: 100;
          background: rgba(247,244,239,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #D4CFC7;
          padding: 0 40px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .gramos-nav-logo { display: flex; align-items: center; gap: 10px; }

        .gramos-logo-mark {
          width: 34px; height: 34px;
          background: #2D5016; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500; color: #F7F4EF; letter-spacing: 0.5px;
        }

        .gramos-brand {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #3D2B1F; letter-spacing: -0.3px;
        }

        .gramos-nav-links { display: flex; gap: 8px; align-items: center; }

        .gramos-nav-link {
          font-size: 14px; font-weight: 400; color: #6B4C38;
          padding: 6px 14px; border-radius: 6px;
          background: none; border: none; cursor: pointer; transition: all 0.2s;
        }
        .gramos-nav-link:hover { color: #2D5016; background: rgba(45,80,22,0.06); }

        .gramos-btn-primary {
          background: #2D5016; color: #F7F4EF; border: none;
          padding: 8px 20px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .gramos-btn-primary:hover { background: #4A7C2F; transform: translateY(-1px); }

        .gramos-btn-secondary {
          background: transparent; color: #2D5016;
          border: 1.5px solid #4A7C2F;
          padding: 8px 20px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .gramos-btn-secondary:hover { background: rgba(45,80,22,0.06); }

        .gramos-hero {
          min-height: 100vh; padding: 120px 40px 80px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
          max-width: 1200px; margin: 0 auto;
          background-image: radial-gradient(circle, rgba(61,43,31,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .gramos-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #C4730A;
          margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
        }
        .gramos-eyebrow::before { content: ''; width: 32px; height: 1.5px; background: #C4730A; }

        .gramos-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 5vw, 68px); font-weight: 900;
          line-height: 1.06; letter-spacing: -1.5px; color: #3D2B1F; margin-bottom: 28px;
        }
        .gramos-h1 em { font-style: italic; color: #2D5016; }

        .gramos-hero-sub {
          font-size: 17px; font-weight: 300; line-height: 1.75;
          color: #6B4C38; max-width: 480px; margin-bottom: 40px;
        }

        .gramos-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
        .gramos-hero-actions .gramos-btn-primary { padding: 13px 28px; font-size: 15px; }
        .gramos-hero-actions .gramos-btn-secondary { padding: 13px 28px; font-size: 15px; }

        .gramos-hero-stats {
          display: flex; gap: 32px;
          padding-top: 32px; border-top: 1px solid #D4CFC7;
        }

        .gramos-stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #3D2B1F;
        }

        .gramos-stat-label { font-size: 12px; font-weight: 400; color: #A07858; margin-top: 2px; line-height: 1.4; }

        .gramos-hero-visual { position: relative; height: 560px; }

        .gramos-card-main {
          position: absolute; top: 0; right: 0; width: 340px;
          background: #fff; border-radius: 16px; border: 1px solid #D4CFC7;
          overflow: hidden; box-shadow: 0 4px 32px rgba(61,43,31,0.08);
          animation: fadeUp 0.8s 0.35s ease both;
        }

        .gramos-card-header { background: #2D5016; padding: 16px 20px; color: #F7F4EF; }
        .gramos-card-header-label {
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; opacity: 0.7; margin-bottom: 6px;
        }
        .gramos-card-price { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; }
        .gramos-card-price span { font-size: 14px; font-weight: 400; opacity: 0.8; }

        .gramos-card-body { padding: 16px 20px; }

        .gramos-price-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid #EDE9E0; font-size: 13px;
        }
        .gramos-price-row:last-child { border-bottom: none; }
        .gramos-price-label { color: #6B4C38; }
        .gramos-price-value { font-weight: 500; font-family: 'DM Mono', monospace; font-size: 12px; color: #3D2B1F; }
        .gramos-price-up { color: #4A7C2F; }
        .gramos-price-down { color: #C0392B; }

        .gramos-card-secondary {
          position: absolute; bottom: 60px; left: 0; width: 260px;
          background: #3D2B1F; border-radius: 14px; padding: 20px; color: #F7F4EF;
          animation: fadeUp 0.8s 0.65s ease both;
        }
        .gramos-card-secondary-label {
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 10px;
        }
        .gramos-lang-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .gramos-lang-pill {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px; padding: 4px 10px; font-size: 12px; color: rgba(247,244,239,0.85);
        }

        .gramos-card-tertiary {
          position: absolute; top: 200px; left: 20px; width: 200px;
          background: #F0A030; border-radius: 12px; padding: 16px;
          animation: fadeUp 0.8s 0.5s ease both;
        }
        .gramos-card-tertiary-label {
          font-size: 11px; font-weight: 500; color: #3D2B1F; opacity: 0.7; margin-bottom: 8px;
          font-family: 'DM Mono', monospace; letter-spacing: 1px;
        }
        .gramos-ai-chip { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #3D2B1F; margin-bottom: 4px; }
        .gramos-ai-chip-sub { font-size: 12px; color: #3D2B1F; opacity: 0.65; }

        .gramos-trust-bar {
          background: #3D2B1F; padding: 20px 40px;
          display: flex; justify-content: center; align-items: center;
          gap: 60px; flex-wrap: wrap;
        }
        .gramos-trust-item { display: flex; align-items: center; gap: 10px; color: #D4CFC7; font-size: 13px; }
        .gramos-trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #F0A030; flex-shrink: 0; }

        .gramos-section { padding: 100px 40px; }
        .gramos-section-inner { max-width: 1200px; margin: 0 auto; }

        .gramos-section-tag {
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: #A07858; margin-bottom: 14px;
        }

        .gramos-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3.5vw, 48px); font-weight: 900;
          line-height: 1.1; letter-spacing: -1px; color: #3D2B1F; margin-bottom: 16px;
        }
        .gramos-h2 em { font-style: italic; color: #2D5016; }
        .gramos-h2.light { color: #F7F4EF; }
        .gramos-h2.light em { color: #6BA033; }

        .gramos-section-sub { font-size: 16px; font-weight: 300; color: #6B4C38; line-height: 1.7; max-width: 560px; }
        .gramos-section-sub.light { color: #D4CFC7; }

        .gramos-hiw-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #D4CFC7;
          border: 1px solid #D4CFC7; border-radius: 16px; overflow: hidden; margin-top: 64px;
        }
        .gramos-hiw-item { background: #fff; padding: 40px 36px; }
        .gramos-hiw-step {
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
          color: #A07858; margin-bottom: 20px;
        }
        .gramos-hiw-icon {
          width: 48px; height: 48px; background: #F7F4EF; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px; border: 1px solid #EDE9E0;
        }
        .gramos-hiw-title {
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
          color: #3D2B1F; margin-bottom: 12px;
        }
        .gramos-hiw-desc { font-size: 14px; font-weight: 300; color: #6B4C38; line-height: 1.7; }

        .gramos-roles-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 64px; }

        .gramos-role-card {
          background: #fff; border-radius: 16px; padding: 32px 24px;
          border: 1px solid #D4CFC7; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gramos-role-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(61,43,31,0.1); }

        .gramos-role-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
        .accent-farmer { background: #2D5016; }
        .accent-retailer { background: #C4730A; }
        .accent-consumer { background: #1A3A5C; }
        .accent-worker { background: #6B4C38; }

        .gramos-role-emoji { font-size: 28px; margin-bottom: 16px; display: block; }
        .gramos-role-name {
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
          color: #3D2B1F; margin-bottom: 10px;
        }
        .gramos-role-desc { font-size: 13px; font-weight: 300; color: #6B4C38; line-height: 1.65; margin-bottom: 20px; }
        .gramos-role-features { list-style: none; }
        .gramos-role-feature {
          font-size: 12px; color: #6B4C38; padding: 5px 0;
          border-bottom: 1px solid #EDE9E0; display: flex; align-items: center; gap: 6px;
        }
        .gramos-role-feature:last-child { border-bottom: none; }
        .gramos-role-feature::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: #A07858; flex-shrink: 0;
        }

        .gramos-features-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 2px; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; overflow: hidden; margin-top: 64px;
        }
        .gramos-feature-item {
          background: rgba(255,255,255,0.03); padding: 32px 28px; transition: background 0.2s;
        }
        .gramos-feature-item:hover { background: rgba(255,255,255,0.06); }
        .gramos-feature-pill {
          display: inline-block;
          background: rgba(196,115,10,0.2); color: #F0A030;
          border: 1px solid rgba(196,115,10,0.3);
          border-radius: 20px; padding: 3px 10px;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; margin-bottom: 16px;
        }
        .gramos-feature-title {
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
          color: #F7F4EF; margin-bottom: 10px;
        }
        .gramos-feature-desc { font-size: 13px; font-weight: 300; color: rgba(212,207,199,0.8); line-height: 1.7; }

        .gramos-quote-section { background: #2D5016; padding: 80px 40px; text-align: center; }
        .gramos-quote-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 40px); font-weight: 700; font-style: italic;
          color: #F7F4EF; max-width: 800px; margin: 0 auto 20px;
          line-height: 1.3; letter-spacing: -0.5px;
        }
        .gramos-quote-attr {
          font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px;
          color: rgba(247,244,239,0.45);
        }

        .gramos-cta-section { background: #F7F4EF; padding: 120px 40px; text-align: center; }
        .gramos-cta-inner { max-width: 640px; margin: 0 auto; }
        .gramos-cta-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 56px); font-weight: 900; color: #3D2B1F;
          line-height: 1.1; letter-spacing: -1px; margin-bottom: 20px;
        }
        .gramos-cta-h2 em { font-style: italic; color: #2D5016; }
        .gramos-cta-sub { font-size: 16px; font-weight: 300; color: #6B4C38; line-height: 1.7; margin-bottom: 40px; }
        .gramos-cta-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }

        .gramos-btn-cta {
          background: #2D5016; color: #F7F4EF; border: none;
          padding: 14px 32px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .gramos-btn-cta:hover { background: #4A7C2F; transform: translateY(-1px); }

        .gramos-btn-cta-outline {
          background: transparent; color: #3D2B1F;
          border: 1.5px solid #D4CFC7;
          padding: 14px 32px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .gramos-btn-cta-outline:hover { border-color: #A07858; }

        .gramos-footer { background: #3D2B1F; padding: 48px 40px; color: #D4CFC7; }
        .gramos-footer-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
        }
        .gramos-footer-brand { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #F7F4EF; }
        .gramos-footer-tagline { font-size: 13px; color: #A07858; margin-top: 4px; }
        .gramos-footer-links { display: flex; gap: 24px; }
        .gramos-footer-link { font-size: 13px; color: #D4CFC7; text-decoration: none; opacity: 0.6; transition: opacity 0.2s; cursor: pointer; background: none; border: none; }
        .gramos-footer-link:hover { opacity: 1; }
        .gramos-footer-copy {
          width: 100%; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 12px; color: #A07858; text-align: center;
          font-family: 'DM Mono', monospace; letter-spacing: 0.5px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gramos-hero-left > * { opacity: 0; animation: fadeUp 0.7s ease forwards; }
        .gramos-hero-left > *:nth-child(1) { animation-delay: 0.1s; }
        .gramos-hero-left > *:nth-child(2) { animation-delay: 0.2s; }
        .gramos-hero-left > *:nth-child(3) { animation-delay: 0.3s; }
        .gramos-hero-left > *:nth-child(4) { animation-delay: 0.4s; }
        .gramos-hero-left > *:nth-child(5) { animation-delay: 0.5s; }

        @media (max-width: 900px) {
          .gramos-hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .gramos-hero-visual { display: none; }
          .gramos-hiw-grid { grid-template-columns: 1fr; }
          .gramos-roles-grid { grid-template-columns: 1fr 1fr; }
          .gramos-features-grid { grid-template-columns: 1fr; }
          .gramos-trust-bar { gap: 24px; padding: 20px 24px; }
          .gramos-section { padding: 60px 24px; }
          nav { padding: 0 24px; }
        }

        @media (max-width: 560px) {
          .gramos-roles-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="gramos-nav">
        <div className="gramos-nav-logo">
          <div className="gramos-logo-mark">G</div>
          <span className="gramos-brand">GramOS</span>
        </div>
        <div className="gramos-nav-links">
          <button className="gramos-btn-primary" onClick={() => handleAuth("signup")}>Start Free</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "#F7F4EF" }}>
        <div className="gramos-hero">
          <div className="gramos-hero-left">
            <div className="gramos-eyebrow">Agricultural Intelligence Platform</div>
            <h1 className="gramos-h1">
              Where <em>India's farms</em> meet the digital future
            </h1>
            <p className="gramos-hero-sub">
              GramOS connects farmers, retailers, and consumers through a unified marketplace with AI-powered crop analytics, real-time mandi pricing, and multilingual voice support — from field to fork, in your language.
            </p>
            <div className="gramos-hero-actions">
              <button className="gramos-btn-primary" onClick={() => handleAuth("signup")}>Join as Farmer</button>
              <button className="gramos-btn-secondary" onClick={() => handleAuth("login")}>Explore Platform</button>
            </div>
            <div className="gramos-hero-stats">
              <div>
                <div className="gramos-stat-number">6+</div>
                <div className="gramos-stat-label">Regional languages<br />supported</div>
              </div>
              <div>
                <div className="gramos-stat-number">₹0</div>
                <div className="gramos-stat-label">Commission on<br />direct sales</div>
              </div>
              <div>
                <div className="gramos-stat-number">AI</div>
                <div className="gramos-stat-label">Crop yield &amp;<br />price predictions</div>
              </div>
            </div>
          </div>

          <div className="gramos-hero-visual">
            <div className="gramos-card-main">
              <div className="gramos-card-header">
                <div className="gramos-card-header-label">LIVE MANDI PRICE — TOMATO</div>
                <div className="gramos-card-price">₹28.50 <span>/ kg</span></div>
              </div>
              <div className="gramos-card-body">
                {[
                  { label: "Nashik APMC", value: "₹28.50 ↑", cls: "gramos-price-up" },
                  { label: "Pune APMC", value: "₹27.00 ↑", cls: "gramos-price-up" },
                  { label: "Mumbai Market", value: "₹32.00 ↓", cls: "gramos-price-down" },
                  { label: "MSP Benchmark", value: "₹22.00", cls: "" },
                  { label: "AI 7-day forecast", value: "₹31.20 ↑", cls: "gramos-price-up" },
                ].map((row) => (
                  <div className="gramos-price-row" key={row.label}>
                    <span className="gramos-price-label">{row.label}</span>
                    <span className={`gramos-price-value ${row.cls}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gramos-card-tertiary">
              <div className="gramos-card-tertiary-label">AI YIELD ANALYSIS</div>
              <div className="gramos-ai-chip">94% confidence</div>
              <div className="gramos-ai-chip-sub">Best harvest window: Oct 12–18</div>
            </div>

            <div className="gramos-card-secondary">
              <div className="gramos-card-secondary-label">VOICE SUPPORT IN</div>
              <div className="gramos-lang-pills">
                {["हिंदी", "मराठी", "বাংলা", "தமிழ்", "ગુજરાતી", "తెలుగు"].map((l) => (
                  <span className="gramos-lang-pill" key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="gramos-section" style={{ background: "#fff" }}>
        <div className="gramos-section-inner">
          <div className="gramos-section-tag">How it works</div>
          <h2 className="gramos-h2">Farm to fork, <em>without the middlemen</em></h2>
          <p className="gramos-section-sub">A transparent supply chain that gives farmers fair prices and consumers full traceability — powered by data at every step.</p>
          <div className="gramos-hiw-grid">
            {[
              { step: "STEP 01", icon: "🌱", title: "Farmer lists produce", desc: "Register your crop with AI-assisted quality grading, yield estimates, and auto-suggested pricing based on live mandi rates across Maharashtra, UP, Punjab, and beyond." },
              { step: "STEP 02", icon: "🔗", title: "Market connects you", desc: "Retailers, FPOs, and bulk buyers browse verified listings. Every product gets a QR-linked supply chain record tracking origin, handling, transport, and storage." },
              { step: "STEP 03", icon: "💸", title: "You get paid, fairly", desc: "Instant Razorpay settlements with full GST compliance. Build your trust score to unlock working capital loans — no collateral, no bank visit required." },
            ].map((item) => (
              <div className="gramos-hiw-item" key={item.step}>
                <div className="gramos-hiw-step">{item.step}</div>
                <div className="gramos-hiw-icon">{item.icon}</div>
                <div className="gramos-hiw-title">{item.title}</div>
                <p className="gramos-hiw-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="gramos-section" style={{ background: "#EDE9E0" }}>
        <div className="gramos-section-inner">
          <div className="gramos-section-tag">Built for every stakeholder</div>
          <h2 className="gramos-h2">One platform, <em>four perspectives</em></h2>
          <p className="gramos-section-sub">Role-specific dashboards built for how each stakeholder actually works — not generic software adapted for agriculture.</p>
          <div className="gramos-roles-grid">
            {[
              {
                cls: "farmer", accent: "accent-farmer", emoji: "🌾", name: "Farmers",
                desc: "Sell directly. Earn more. Borrow when you need it — without the bank.",
                features: ["Live mandi price comparison", "AI yield & harvest predictor", "Direct retail buyer access", "Trust-score micro-loans", "Voice input in 6 languages"],
              },
              {
                cls: "retailer", accent: "accent-retailer", emoji: "🏪", name: "Retailers",
                desc: "Source directly from farmers. Know exactly what you're buying before it arrives.",
                features: ["Browse verified farm listings", "QR-scan supply chain history", "Profit margin AI analysis", "Razorpay checkout with GST", "Inventory & reorder management"],
              },
              {
                cls: "consumer", accent: "accent-consumer", emoji: "🛒", name: "Consumers",
                desc: "Know where your food came from. Every vegetable has a story.",
                features: ["QR scan farm-to-shelf trace", "Freshness & handling records", "Direct farmer discovery", "Subscription produce boxes", "Seasonal crop calendars"],
              },
              {
                cls: "worker", accent: "accent-worker", emoji: "👷", name: "Agri Workers",
                desc: "Find seasonal work near you. Build credentials that travel.",
                features: ["Location-based job board", "Skill verification badges", "Wage transparency tools", "Training & certification", "Digital payment history"],
              },
            ].map((role) => (
              <div className={`gramos-role-card ${role.cls}`} key={role.name}>
                <div className={`gramos-role-accent ${role.accent}`}></div>
                <span className="gramos-role-emoji">{role.emoji}</span>
                <div className="gramos-role-name">{role.name}</div>
                <p className="gramos-role-desc">{role.desc}</p>
                <ul className="gramos-role-features">
                  {role.features.map((f) => (
                    <li className="gramos-role-feature" key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="gramos-section" style={{ background: "#3D2B1F" }}>
        <div className="gramos-section-inner">
          <div className="gramos-section-tag" style={{ color: "#A07858" }}>Intelligence layer</div>
          <h2 className="gramos-h2 light">Not just a marketplace — <em>a brain for your farm</em></h2>
          <p className="gramos-section-sub light">Every feature is built around one goal: helping farmers make better decisions with less effort.</p>
          <div className="gramos-features-grid">
            {[
              { pill: "GROQ AI", title: "Crop Yield Analysis", desc: "AI-powered harvest timing, yield forecasting, and pest risk alerts based on your location, crop type, and current weather signals." },
              { pill: "REAL-TIME", title: "APMC Price Feeds", desc: "Live price data from mandis across India — compare Nashik, Pune, Delhi, and 50+ markets before you decide where to sell your quintal." },
              { pill: "FINTECH", title: "Trust-Score Loans", desc: "Your transaction history on GramOS builds a reputation score. Use it to access working capital loans without collateral — disbursed in hours." },
              { pill: "TRACEABILITY", title: "QR Supply Chain", desc: "Every batch gets a QR code at harvest. Retailers and consumers scan to see the full journey — field, transport, cold chain, retail shelf." },
              { pill: "LANGUAGE", title: "Voice-First Interface", desc: "Dictate listings, ask price questions, negotiate deals — all in Hindi, Marathi, Bengali, Tamil, Gujarati, or Telugu. No typing required." },
              { pill: "LOCATION", title: "Hyperlocal Matching", desc: "GPS-based buyer-seller matching minimizes transport distance, cuts spoilage, and improves margins for both sides of every transaction." },
            ].map((f) => (
              <div className="gramos-feature-item" key={f.title}>
                <div className="gramos-feature-pill">{f.pill}</div>
                <div className="gramos-feature-title">{f.title}</div>
                <p className="gramos-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <div className="gramos-quote-section">
        <p className="gramos-quote-text">"The farmer who knows his market price at harvest time earns 40% more than the one who doesn't."</p>
        <div className="gramos-quote-attr">— NATIONAL SAMPLE SURVEY, MINISTRY OF AGRICULTURE</div>
      </div>

      {/* CTA */}
      <section className="gramos-cta-section">
        <div className="gramos-cta-inner">
          <div className="gramos-section-tag" style={{ textAlign: "center", display: "block" }}>Get started today</div>
          <h2 className="gramos-cta-h2">The market is <em>already open.</em> Are you in it?</h2>
          <p className="gramos-cta-sub">Join farmers, retailers, and agri workers building a fairer, more transparent rural economy — one transaction at a time.</p>
          <div className="gramos-cta-actions">
            <button className="gramos-btn-cta" onClick={() => handleAuth("signup")}>Create Free Account</button>
            <button className="gramos-btn-cta-outline" onClick={() => handleAuth("login")}>See a Live Demo</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="gramos-footer">
        <div className="gramos-footer-inner">
          <div>
            <div className="gramos-footer-brand">GramOS</div>
            <div className="gramos-footer-tagline">Agricultural Intelligence Platform — India</div>
          </div>
          <div className="gramos-footer-links">
            {["Privacy", "Terms", "API", "Contact"].map((l) => (
              <button className="gramos-footer-link" key={l}>{l}</button>
            ))}
          </div>
        </div>
        <div className="gramos-footer-copy">© 2025 GramOS. Built for rural India. All rights reserved.</div>
      </footer>
    </div>
  );
}