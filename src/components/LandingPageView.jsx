import React from 'react';
import {
  Wallet,
  CalendarClock,
  PiggyBank,
  Percent,
  Download,
  ShieldCheck,
  GraduationCap,
  Home,
  Briefcase,
  Check,
  ArrowRight,
  Gauge
} from 'lucide-react';

const STEPS = [
  { title: 'Add your money', text: 'Record the pocket money, salary or payments that came in.' },
  { title: 'Split it into budgets', text: 'Decide how much goes to food, rent, travel or software.' },
  { title: 'Record what you spend', text: 'Each expense comes out of one budget, so you always see what is left.' },
  { title: 'Save what is left', text: 'Put money aside for a trip, an emergency or next year’s tax.' }
];

const AUDIENCES = [
  {
    type: 'Student Account',
    icon: GraduationCap,
    title: 'Students',
    cta: 'Start as a student',
    text: 'Make pocket money last the whole month.',
    points: ['How much you can spend today', 'Food, travel and books budgets', 'Savings for trips and laptops']
  },
  {
    type: 'Personal Account',
    icon: Home,
    title: 'Households',
    cta: 'Start as a household',
    text: 'Run the house on a salary without surprises.',
    points: ['Money left after bills', 'Bill reminders with one-tap paid', 'Emergency fund in months']
  },
  {
    type: 'Corporate SaaS',
    icon: Briefcase,
    title: 'Small businesses',
    cta: 'Start as a business',
    text: 'Keep an eye on cash, costs and tax.',
    points: ['Months of cash left', 'Profit this month', 'Tax set aside and top payees']
  }
];

const FEATURES = [
  { icon: Wallet, title: 'See what is left', text: 'Every budget shows how much you can still spend.' },
  { icon: Gauge, title: 'A safe daily amount', text: 'Know how much you can spend today and still last the month.' },
  { icon: CalendarClock, title: 'Bills on time', text: 'See what is due next and mark bills paid in one tap.' },
  { icon: PiggyBank, title: 'Savings goals', text: 'Track progress and how much to save each month.' },
  { icon: Percent, title: 'Tax set aside', text: 'For businesses: keep enough aside for tax as money comes in.' },
  { icon: Download, title: 'Download statements', text: 'Get your history as a spreadsheet any time.' }
];

export default function LandingPageView({ onOpenAuth }) {
  const signUp = (type) => onOpenAuth('signup', type);

  return (
    <div className="x-landing">
      <header className="x-land-nav">
        <div className="x-land-wrap x-land-nav-inner">
          <div className="x-brand">
            <span className="x-brand-mark">X</span>
            <span className="x-brand-name">Xpense</span>
          </div>
          <nav className="x-land-links" aria-label="Page sections">
            <a href="#how-it-works">How it works</a>
            <a href="#who">Who it is for</a>
            <a href="#features">Features</a>
          </nav>
          <div className="x-land-actions">
            <button type="button" id="landing-btn-signin" className="x-btn x-btn-ghost" onClick={() => onOpenAuth('login')}>Sign in</button>
            <button type="button" id="landing-btn-getstarted" className="x-btn x-btn-primary" onClick={() => signUp()}>Create free account</button>
          </div>
        </div>
      </header>

      <main>
        <section className="x-land-wrap x-land-hero">
          <div className="x-land-hero-text">
            <span className="x-overline">Simple money planning</span>
            <h1 className="x-land-title">Know where your money goes — before it’s gone.</h1>
            <p className="x-land-lead">
              Xpense helps you split your money into budgets, see what is left, pay bills on time and save for what
              matters. Free, simple and private.
            </p>
            <div className="x-land-ctas">
              <button type="button" id="hero-btn-create-account" className="x-btn x-btn-primary x-btn-lg" onClick={() => signUp()}>
                Create free account <ArrowRight size={16} />
              </button>
              <button type="button" id="hero-btn-workspace-login" className="x-btn x-btn-secondary x-btn-lg" onClick={() => onOpenAuth('login')}>
                Sign in
              </button>
            </div>
            <p className="x-small x-muted">Payments in Xpense are for practice — no real money moves.</p>
          </div>

          <div className="x-land-preview" aria-hidden="true">
            <div className="x-hero x-land-preview-hero">
              <span className="x-overline x-on-dark">Money you have</span>
              <div className="x-hero-amount">₹12,450</div>
              <p className="x-hero-note">You can spend ₹410 today and still last the month.</p>
            </div>
            <div className="x-card x-land-preview-list">
              {[
                { name: 'Food & canteen', left: 1850, of: 2500, tone: 'brand' },
                { name: 'Travel', left: 300, of: 800, tone: 'brand' },
                { name: 'Fun & outings', left: 90, of: 1000, tone: 'danger' }
              ].map((b) => (
                <div key={b.name} className="x-land-preview-row">
                  <div className="x-row-between x-small">
                    <span className="x-strong">{b.name}</span>
                    <span className="x-muted">₹{b.left.toLocaleString('en-IN')} left</span>
                  </div>
                  <div className="x-progress">
                    <div className={`x-progress-fill x-tone-${b.tone}`} style={{ width: `${(b.left / b.of) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="x-land-section">
          <div className="x-land-wrap">
            <h2 className="x-land-h2">How it works</h2>
            <p className="x-land-sub">Four steps. No spreadsheets, no finance words.</p>
            <ol className="x-land-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="x-card">
                  <span className="x-step-num">{i + 1}</span>
                  <h3 className="x-h3">{s.title}</h3>
                  <p className="x-small x-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="who" className="x-land-section x-land-alt">
          <div className="x-land-wrap">
            <h2 className="x-land-h2">One app, made for you</h2>
            <p className="x-land-sub">Pick the account that fits. Each one gets its own dashboard.</p>
            <div className="x-land-cards">
              {AUDIENCES.map(({ type, icon: Icon, title, cta, text, points }) => (
                <article key={type} className="x-card x-land-audience">
                  <span className="x-cat x-cat-c1" style={{ width: 44, height: 44 }}><Icon size={20} /></span>
                  <h3 className="x-h2">{title}</h3>
                  <p className="x-muted">{text}</p>
                  <ul className="x-land-points">
                    {points.map((p) => (
                      <li key={p}><Check size={15} className="x-text-brand" /> {p}</li>
                    ))}
                  </ul>
                  <button type="button" className="x-btn x-btn-secondary x-btn-block" onClick={() => signUp(type)}>
                    {cta}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="x-land-section">
          <div className="x-land-wrap">
            <h2 className="x-land-h2">Everything you need, nothing you don’t</h2>
            <div className="x-land-features">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="x-land-feature">
                  <Icon size={20} className="x-text-brand" />
                  <div>
                    <h3 className="x-h3">{title}</h3>
                    <p className="x-small x-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="x-land-section">
          <div className="x-land-wrap">
            <div className="x-land-cta">
              <div>
                <h2 className="x-land-h2 x-on-dark-title">Take control of your money this month.</h2>
                <p className="x-on-dark">It takes less than a minute to start.</p>
              </div>
              <button type="button" className="x-btn x-btn-lg x-land-cta-btn" onClick={() => signUp()}>
                Create free account
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="x-land-footer">
        <div className="x-land-wrap x-land-footer-inner">
          <span className="x-inline-icon x-small x-muted">
            <ShieldCheck size={16} /> Your data is private. Only you can see it after signing in.
          </span>
          <span className="x-small x-muted">© {new Date().getFullYear()} Xpense</span>
        </div>
      </footer>
    </div>
  );
}
