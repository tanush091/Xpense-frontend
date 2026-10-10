// Building blocks shared by the Student, Personal and Business Home screens.
import React from 'react';
import { Eye, EyeOff, ArrowRight, Check, Plus, Lightbulb, AlertTriangle, ArrowDownLeft, Wallet } from 'lucide-react';
import { formatINR, formatDayLabel, formatTime, greetingFor, firstName, txDate } from '../../lib/format';
import CategoryIcon from '../../components/ui/CategoryIcon';
import HealthBadge from '../../components/ui/HealthBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';

export const HEALTH_TONE = { good: 'brand', low: 'warn', empty: 'danger', unfunded: 'brand' };

export function Greeting({ user, subtitle }) {
  return (
    <div className="x-page-head">
      <div>
        <h1 className="x-h1">
          {greetingFor()}, {firstName(user)}
        </h1>
        {subtitle && <p className="x-page-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

/** The dark headline card: one big number, a one-line explanation, and up to three parts below it. */
export function HeroCard({ label, amount, note, stats = [], masked, onToggleMask }) {
  const show = (v) => (masked ? '••••••' : formatINR(v));
  return (
    <div className="x-hero">
      <div className="x-hero-top">
        <span className="x-overline x-on-dark">{label}</span>
        <button
          type="button"
          className="x-icon-btn x-on-dark"
          onClick={onToggleMask}
          aria-label={masked ? 'Show amounts' : 'Hide amounts'}
          title={masked ? 'Show amounts' : 'Hide amounts'}
        >
          {masked ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <div className="x-hero-amount">{show(amount)}</div>
      {note && <p className="x-hero-note">{note}</p>}
      {stats.length > 0 && (
        <div className="x-hero-split">
          {stats.map((st) => (
            <button key={st.label} type="button" className="x-hero-stat" onClick={st.onClick}>
              <span className="x-hero-stat-label">{st.label}</span>
              <span className="x-hero-stat-value">{show(st.value)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** "How Xpense works": the four first steps, shown until all are done. */
export function SetupCard({ steps, onAction }) {
  const done = steps.filter((s) => s.done).length;
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">How Xpense works</h2>
          <p className="x-card-sub">Four steps to take control of your money. {done} of {steps.length} done.</p>
        </div>
      </div>
      <ol className="x-steps">
        {steps.map((step, i) => (
          <li key={step.id} className={`x-step ${step.done ? 'is-done' : ''}`}>
            <span className="x-step-num" aria-hidden="true">
              {step.done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
            </span>
            <div className="x-step-body">
              <div className="x-step-title">{step.title}</div>
              <p className="x-step-text">{step.description}</p>
              {!step.done && (
                <button type="button" className="x-link" onClick={() => onAction(step.action)}>
                  {step.actionLabel} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Row of four small cards. Each item: { label, value, note, tone }. */
export function MetricsRow({ items }) {
  return (
    <section className="x-metrics">
      {items.map((m) => (
        <div key={m.label} className="x-metric">
          <span className="x-overline">{m.label}</span>
          <span className={`x-metric-value ${m.tone ? `x-text-${m.tone}` : ''}`}>{m.value}</span>
          {m.note && <span className="x-metric-note">{m.note}</span>}
        </div>
      ))}
    </section>
  );
}

export function AttentionNotice({ budgets }) {
  if (!budgets || budgets.length === 0) return null;
  return (
    <div className="x-notice x-notice-warn" role="status">
      <AlertTriangle size={17} />
      <span>
        {budgets.length === 1
          ? `${budgets[0].name} is ${budgets[0].health.label.toLowerCase()}.`
          : `${budgets.length} budgets are running low.`}{' '}
        {budgets.length === 1 ? 'Add money to it' : 'Add money to them'} or spend a little less this week.
      </span>
    </div>
  );
}

export function BudgetsCard({ budgets, subtitle = "What's left to spend in each part of your month", onNavigate, onAddMoneyToBudget }) {
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Your budgets</h2>
          <p className="x-card-sub">{subtitle}</p>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate('wallets')}>
          Manage <ArrowRight size={14} />
        </button>
      </div>
      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets yet"
          text="Create a budget so you always know what's left for each part of your month."
          action={
            <button type="button" className="x-btn x-btn-secondary" onClick={() => onNavigate('wallets')}>
              <Plus size={16} /> Create a budget
            </button>
          }
        />
      ) : (
        <ul className="x-list">
          {budgets.map((b) => (
            <li key={b.id} className="x-budget-row">
              <CategoryIcon category={b.category} name={b.name} />
              <div className="x-budget-main">
                <div className="x-row-between">
                  <span className="x-row-title">{b.name}</span>
                  <HealthBadge health={b.health} />
                </div>
                <ProgressBar
                  value={b.limit > 0 ? (b.left / b.limit) * 100 : 0}
                  tone={HEALTH_TONE[b.health.key]}
                  label={`${b.name}: money left`}
                />
                <div className="x-row-between x-small x-muted">
                  <span>
                    <strong className="x-strong">{formatINR(b.left)}</strong> left of {formatINR(b.limit)}
                  </span>
                  <button type="button" className="x-link x-small" onClick={() => onAddMoneyToBudget(b)}>
                    Add money
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Bar per day for the last week, with an optional dashed "safe amount" line. */
export function Last7DaysCard({ days, lineValue = 0, lineLabel = 'Safe daily amount' }) {
  const maxBar = Math.max(lineValue, ...days.map((d) => d.amount), 1);
  const empty = days.every((d) => d.amount === 0);
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Last 7 days</h2>
          <p className="x-card-sub">How much you spent each day</p>
        </div>
      </div>
      <div className="x-bars" role="img" aria-label="Spending for each of the last seven days">
        {empty && <div className="x-bars-empty">No spending in the last 7 days</div>}
        {lineValue > 0 && (
          <div className="x-bars-line" style={{ bottom: `calc(28px + (100% - 28px) * ${lineValue / maxBar})` }} />
        )}
        {days.map((d) => (
          <div key={d.label} className="x-bar-col" title={`${d.label}: ${formatINR(d.amount)}`}>
            <div className="x-bar-track">
              <div
                className={`x-bar ${d.isToday ? 'is-today' : ''} ${lineValue > 0 && d.amount > lineValue ? 'is-over' : ''}`}
                style={{ height: `${Math.max(d.amount > 0 ? 4 : 0, (d.amount / maxBar) * 100)}%` }}
              />
            </div>
            <span className="x-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      {lineValue > 0 && (
        <p className="x-chart-key">
          <i className="x-key-dash" aria-hidden="true" /> {lineLabel}: {formatINR(lineValue)}
        </p>
      )}
    </section>
  );
}

export function TipsCard({ tips, onNavigate, linkTab = 'analytics', linkLabel = 'Insights' }) {
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2 x-inline-icon">
            <Lightbulb size={17} /> Tips for you
          </h2>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate(linkTab)}>
          {linkLabel} <ArrowRight size={14} />
        </button>
      </div>
      <ul className="x-tips">
        {tips.map((tip, i) => (
          <li key={i} className={`x-tip x-tip-${tip.tone}`}>
            {tip.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecentActivityCard({ transactions, onNavigate, onAddMoneyIn, linkLabel = 'See all' }) {
  const recent = transactions.slice(0, 6);
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Recent activity</h2>
          <p className="x-card-sub">Your latest money in and money out</p>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate('transactions')}>
          {linkLabel} <ArrowRight size={14} />
        </button>
      </div>
      {recent.length === 0 ? (
        <EmptyState
          icon={ArrowDownLeft}
          title="Nothing here yet"
          text="Add the money that came in this month, then record your first expense."
          action={
            <button type="button" className="x-btn x-btn-secondary" onClick={onAddMoneyIn}>
              Add money in
            </button>
          }
        />
      ) : (
        <ul className="x-list">
          {recent.map((tx) => {
            const income = tx.type === 'income';
            const d = txDate(tx);
            return (
              <li key={tx.id} className="x-tx-row">
                <CategoryIcon category={tx.category} name={tx.title} income={income} size={38} />
                <div className="x-tx-main">
                  <span className="x-row-title">{tx.title}</span>
                  <span className="x-small x-muted">
                    {income ? 'Money in' : tx.wallet_name || tx.category || 'Expense'} · {formatDayLabel(d)}
                    {d ? `, ${formatTime(d)}` : ''}
                  </span>
                </div>
                <span className={`x-amount-cell ${income ? 'x-text-brand' : ''}`}>
                  {income ? '+' : '−'}
                  {formatINR(tx.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
