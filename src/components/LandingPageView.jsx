import React from 'react';
import { 
  Wallet, 
  QrCode, 
  ArrowLeftRight, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Lock, 
  Zap, 
  Layers, 
  ChevronRight,
  Database,
  Smartphone,
  CreditCard
} from 'lucide-react';

export default function LandingPageView({ onOpenAuth }) {
  return (
    <div className="landing-page-root">
      {/* Background ambient lighting glows */}
      <div className="landing-ambient-glow glow-1" />
      <div className="landing-ambient-glow glow-2" />

      {/* Navigation Header */}
      <header className="landing-nav-header">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="brand-icon-sq" style={{ width: '36px', height: '36px', fontSize: '18px' }}>X</div>
            <div className="landing-brand-text">
              <span className="landing-brand-title">Xpense</span>
              <span className="landing-brand-badge">TREASURY OS</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#envelopes">Virtual Envelopes</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#security">Security</a>
          </nav>

          <div className="landing-nav-actions">
            <button 
              className="landing-btn-ghost"
              onClick={() => onOpenAuth('login')}
              id="landing-btn-signin"
            >
              Sign In
            </button>
            <button 
              className="landing-btn-cta"
              onClick={() => onOpenAuth('signup')}
              id="landing-btn-getstarted"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <div className="landing-pill-tag">
            <Sparkles size={14} color="var(--accent-yellow)" />
            <span>Smart Cash-Flow & Virtual Envelope Treasury</span>
          </div>

          <h1 className="landing-hero-headline">
            Smart Money.<br />
            <span className="landing-headline-gradient">Zero Guesswork.</span>
          </h1>

          <p className="landing-hero-subtext">
            Partition funds, spend with instant QR settlement, and track your daily burn-rate in real time. 
            All wired directly to your isolated database ledger.
          </p>

          <div className="landing-hero-ctas">
            <button 
              className="landing-btn-hero-primary"
              onClick={() => onOpenAuth('signup')}
              id="hero-btn-create-account"
            >
              <span>Create Free Account</span>
              <ArrowRight size={17} />
            </button>
            <button 
              className="landing-btn-hero-secondary"
              onClick={() => onOpenAuth('login')}
              id="hero-btn-workspace-login"
            >
              <span>Sign In to Workspace</span>
            </button>
          </div>

          <div className="landing-micro-tags">
            <span className="micro-tag-item"><CheckCircle2 size={13} color="#10b981" /> Zero Hardcoded Data</span>
            <span className="micro-tag-item"><CheckCircle2 size={13} color="#10b981" /> Strict Category Caps</span>
            <span className="micro-tag-item"><CheckCircle2 size={13} color="#10b981" /> Dynamic BharatQR & UPI</span>
            <span className="micro-tag-item"><CheckCircle2 size={13} color="#10b981" /> BCrypt & JWT Security</span>
          </div>
        </div>

        {/* Live Interactive Interface Preview Card */}
        <div className="landing-preview-container">
          <div className="landing-preview-card">
            {/* Topbar of preview */}
            <div className="preview-card-header">
              <div className="preview-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="preview-header-title">
                <Lock size={12} color="#10b981" />
                <span>xpense.app/workspace/ledger</span>
              </div>
              <div className="preview-status-pill">
                <span className="status-dot-pulse" style={{ background: '#10b981' }} />
                <span>DB Live</span>
              </div>
            </div>

            {/* Simulated Live Dashboard Metrics */}
            <div className="preview-metrics-grid">
              <div className="preview-metric-box">
                <span className="metric-box-label">Total Treasury Balance</span>
                <div className="metric-box-val">₹24,500.00</div>
                <span className="metric-box-sub" style={{ color: '#10b981' }}>+100% Real-Time Ledger</span>
              </div>
              <div className="preview-metric-box">
                <span className="metric-box-label">Monthly Expenditure</span>
                <div className="metric-box-val">₹6,850.00</div>
                <span className="metric-box-sub" style={{ color: '#facc15' }}>Across 4 Envelopes</span>
              </div>
              <div className="preview-metric-box">
                <span className="metric-box-label">Available Headroom</span>
                <div className="metric-box-val" style={{ color: '#38bdf8' }}>72% Safe</div>
                <span className="metric-box-sub">No spillover risk</span>
              </div>
            </div>

            {/* Simulated Envelopes List in preview */}
            <div className="preview-envelopes-wrap">
              <div className="preview-envelope-item">
                <div className="preview-env-meta">
                  <div className="preview-env-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Wallet size={16} />
                  </div>
                  <div>
                    <div className="preview-env-name">Food & Dining</div>
                    <div className="preview-env-sub">Cap: ₹4,000</div>
                  </div>
                </div>
                <div className="preview-env-right">
                  <span className="preview-env-amount">₹2,450 rem.</span>
                  <div className="preview-meter-bar">
                    <div className="preview-meter-fill" style={{ width: '61%', background: '#10b981' }} />
                  </div>
                </div>
              </div>

              <div className="preview-envelope-item">
                <div className="preview-env-meta">
                  <div className="preview-env-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <div className="preview-env-name">Transit & Commute</div>
                    <div className="preview-env-sub">Cap: ₹2,000</div>
                  </div>
                </div>
                <div className="preview-env-right">
                  <span className="preview-env-amount">₹1,150 rem.</span>
                  <div className="preview-meter-bar">
                    <div className="preview-meter-fill" style={{ width: '57%', background: '#3b82f6' }} />
                  </div>
                </div>
              </div>

              <div className="preview-envelope-item">
                <div className="preview-env-meta">
                  <div className="preview-env-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                    <QrCode size={16} />
                  </div>
                  <div>
                    <div className="preview-env-name">Instant UPI QR Pay</div>
                    <div className="preview-env-sub">Merchant Settlement</div>
                  </div>
                </div>
                <div className="preview-env-right">
                  <span className="preview-qr-badge">Instant Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segment 1 Features Section in "Small Words" */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <div className="section-eyebrow">CORE ARCHITECTURE</div>
          <h2 className="section-title">Features in Small Words</h2>
          <p className="section-desc">
            No jargon. No financial fluff. Concise capabilities engineered for pure control.
          </p>
        </div>

        <div className="landing-bento-grid">
          {/* Card 1: Virtual Envelopes */}
          <div className="bento-card" id="envelopes">
            <div className="bento-card-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Wallet size={24} />
            </div>
            <div className="bento-badge">STRICT BUDGET CAPS</div>
            <h3 className="bento-title">Virtual Envelopes</h3>
            <p className="bento-text">
              Partition funds before you spend. Set hard category limits for dining, travel, and bills. 
              Zero spillover deficits.
            </p>
            <div className="bento-footer-words">
              <span>Allocate</span> · <span>Cap</span> · <span>Enforce</span>
            </div>
          </div>

          {/* Card 2: Instant QR & UPI Payments */}
          <div className="bento-card">
            <div className="bento-card-icon" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15' }}>
              <QrCode size={24} />
            </div>
            <div className="bento-badge">MERCHANT CHECKOUT</div>
            <h3 className="bento-title">Instant QR Payments</h3>
            <p className="bento-text">
              Scan BharatQR or generate dynamic UPI receipts. Real-time deduction directly from the chosen envelope.
            </p>
            <div className="bento-footer-words">
              <span>Scan</span> · <span>Generate</span> · <span>Settle</span>
            </div>
          </div>

          {/* Card 3: Peer Transfers */}
          <div className="bento-card">
            <div className="bento-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <ArrowLeftRight size={24} />
            </div>
            <div className="bento-badge">ZERO COMMISSION</div>
            <h3 className="bento-title">Peer Transfers</h3>
            <p className="bento-text">
              Direct peer-to-peer transfers with friends and team. Select source wallet directly and update ledgers instantly.
            </p>
            <div className="bento-footer-words">
              <span>Choose Source</span> · <span>Send</span> · <span>Zero Fees</span>
            </div>
          </div>

          {/* Card 4: Milestone Goals */}
          <div className="bento-card">
            <div className="bento-card-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
              <Target size={24} />
            </div>
            <div className="bento-badge">CAPITAL LOCKING</div>
            <h3 className="bento-title">Savings Milestones</h3>
            <p className="bento-text">
              Lock liquidity toward emergency funds and long-term targets. Visual progress meters celebrate milestones with confetti.
            </p>
            <div className="bento-footer-words">
              <span>Target</span> · <span>Deposit</span> · <span>Celebrate</span>
            </div>
          </div>

          {/* Card 5: Velocity Analytics */}
          <div className="bento-card">
            <div className="bento-card-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
              <BarChart3 size={24} />
            </div>
            <div className="bento-badge">REAL LEDGER DATA</div>
            <h3 className="bento-title">Velocity Analytics</h3>
            <p className="bento-text">
              Real-time daily burn rate, 7-day spending trajectory, and low-headroom liquidity alerts. Zero random figures.
            </p>
            <div className="bento-footer-words">
              <span>Run-Rate</span> · <span>Trajectory</span> · <span>Runway</span>
            </div>
          </div>

          {/* Card 6: Bank-Grade Security */}
          <div className="bento-card" id="security">
            <div className="bento-card-icon" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="bento-badge">CRYPTOGRAPHIC AUTH</div>
            <h3 className="bento-title">Isolated Security</h3>
            <p className="bento-text">
              BCrypt password hashing, signed HMAC-SHA256 JWT tokens, and strict user-scoped database isolation.
            </p>
            <div className="bento-footer-words">
              <span>JWT</span> · <span>BCrypt</span> · <span>Tenant Scoped</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section" style={{ background: 'rgba(17, 22, 34, 0.4)', borderRadius: '24px', padding: '60px 32px' }}>
        <div className="landing-section-header">
          <div className="section-eyebrow">SIMPLE 3-STEP WORKFLOW</div>
          <h2 className="section-title">How Xpense Operates</h2>
          <p className="section-desc">Get started in under 30 seconds. Seamless from registration to payment.</p>
        </div>

        <div className="landing-steps-grid">
          <div className="step-card">
            <div className="step-number-badge">01</div>
            <h4 className="step-title">Create Workspace</h4>
            <p className="step-text">Register with email and password. Your personal database envelope pool initializes at zero.</p>
          </div>

          <div className="step-card">
            <div className="step-number-badge">02</div>
            <h4 className="step-title">Allocate Envelopes</h4>
            <p className="step-text">Set spending caps for Dining, Travel, and Bills. Funds stay locked to designated categories.</p>
          </div>

          <div className="step-card">
            <div className="step-number-badge">03</div>
            <h4 className="step-title">Transact & Monitor</h4>
            <p className="step-text">Scan QR codes, transfer funds, and watch live spending charts update automatically.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Ready to take control of your financial runway?</h2>
          <p className="cta-banner-desc">
            Sign up now. Experience 100% database-wired virtual envelopes with zero mock values.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="landing-btn-hero-primary"
              onClick={() => onOpenAuth('signup')}
              id="cta-bottom-signup"
            >
              <span>Create Free Account</span>
              <ArrowRight size={17} />
            </button>
            <button 
              className="landing-btn-ghost"
              onClick={() => onOpenAuth('login')}
              id="cta-bottom-signin"
              style={{ padding: '14px 24px', fontSize: '14px', borderRadius: '12px', border: '1px solid var(--border-default)' }}
            >
              Sign In to Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand">
            <div className="brand-icon-sq" style={{ width: '28px', height: '28px', fontSize: '14px' }}>X</div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>Xpense</span>
          </div>

          <div className="footer-status-pill">
            <span className="status-dot-pulse" style={{ background: '#10b981' }} />
            <span>Database Connected (Spring Boot & PostgreSQL/H2)</span>
          </div>

          <div className="footer-copyright">
            © {new Date().getFullYear()} Xpense Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
