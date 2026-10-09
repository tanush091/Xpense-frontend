import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check, Plus, Lightbulb, AlertTriangle, ArrowDownLeft, Wallet } from 'lucide-react';
import { getPersonaConfig } from '../data/personas';
import { formatINR, formatDayLabel, formatTime, greetingFor, firstName, txDate } from '../lib/format';
import CategoryIcon from './ui/CategoryIcon';
import HealthBadge from './ui/HealthBadge';
import ProgressBar from './ui/ProgressBar';
import EmptyState from './ui/EmptyState';

const STEP_ACTION = {
  'money-in': { label: 'Add money in', key: 'moneyIn' },
  budgets: { label: 'Fill a budget', key: 'budgets' },
  expense: { label: 'Add an expense', key: 'expense' },
  goal: { label: 'Create a goal', key: 'goal' }
};

const HEALTH_TONE = { good: 'brand', low: 'warn', empty: 'danger', unfunded: 'brand' };

export default function DashboardView({
  user,
  summary,
  transactions = [],
  onNavigate,
  onAddExpense,
  onAddMoneyIn,
  onAddMoneyToBudget
}) {
  const [masked, setMasked] = useState(false);
  const persona = getPersonaConfig(user?.account_type);
  const s = summary;
  if (!s) return null;

  const hide = (value) => (masked ? '••••••' : formatINR(value));
  const todayPct = s.safeToSpendToday > 0 ? (s.spentToday / s.safeToSpendToday) * 100 : s.spentToday > 0 ? 100 : 0;
  const overToday = s.spentToday > s.safeToSpendToday && s.safeToSpendToday > 0;
  const maxBar = Math.max(s.safeToSpendToday, ...s.last7Days.map((d) => d.amount), 1);
  const recent = transactions.slice(0, 6);
  const doneSteps = s.setupSteps.filter((st) => st.done).length;

  const runStep = (key) => {
    if (key === 'moneyIn') onAddMoneyIn();
    else if (key === 'expense') onAddExpense();
    else if (key === 'budgets') onNavigate('wallets');
    else if (key === 'goal') onNavigate('goals');
  };

  return (
    <div className="x-page">
      {/* Greeting */}
      <div className="x-page-head">
        <div>
          <h1 className="x-h1">
            {greetingFor()}, {firstName(user)}
          </h1>
          <p className="x-page-sub">{persona.copy.homeSubtitle}</p>
        </div>
      </div>

      {/* Hero: the two numbers that matter most */}
      <section className="x-hero-row">
        <div className="x-hero">
          <div className="x-hero-top">
            <span className="x-overline x-on-dark">Money you have</span>
            <button
              type="button"
              className="x-icon-btn x-on-dark"
              onClick={() => setMasked((m) => !m)}
              aria-label={masked ? 'Show amounts' : 'Hide amounts'}
              title={masked ? 'Show amounts' : 'Hide amounts'}
            >
              {masked ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div className="x-hero-amount">{hide(s.moneyYouHave)}</div>
          <p className="x-hero-note">Everything you've added, minus what you've spent and saved.</p>

          <div className="x-hero-split">
            <button type="button" className="x-hero-stat" onClick={() => onNavigate('wallets')}>
              <span className="x-hero-stat-label">In your budgets</span>
              <span className="x-hero-stat-value">{hide(s.inBudgets)}</span>
            </button>
            <button type="button" className="x-hero-stat" onClick={() => onNavigate('wallets')}>
              <span className="x-hero-stat-label">Not in a budget yet</span>
              <span className="x-hero-stat-value">{hide(s.notInBudget)}</span>
            </button>
            <button type="button" className="x-hero-stat" onClick={() => onNavigate('goals')}>
              <span className="x-hero-stat-label">Saved in goals</span>
              <span className="x-hero-stat-value">{hide(s.savedInGoals)}</span>
            </button>
          </div>
        </div>

        <div className="x-card x-safe">
          <span className="x-overline">You can spend today</span>
          <div className="x-safe-amount">{hide(s.safeToSpendToday)}</div>
          <ProgressBar
            value={todayPct}
            tone={overToday ? 'danger' : todayPct >= 80 ? 'warn' : 'brand'}
            label="Spent today compared with your safe amount"
          />
          <div className="x-safe-meta">
            <span>Spent today {hide(s.spentToday)}</span>
            <span className={overToday ? 'x-text-danger' : ''}>
              {overToday ? `${hide(s.spentToday - s.safeToSpendToday)} over` : `${hide(s.leftToday)} left`}
            </span>
          </div>
          <p className="x-help">
            {s.moneyYouHave > 0
              ? `Spend up to this much each day and your money lasts the ${s.daysLeft} ${s.daysLeft === 1 ? 'day' : 'days'} left this month.`
              : 'Add the money you received this month and Xpense will work out how much you can spend each day.'}
          </p>
        </div>
      </section>

      {/* Getting started: shows the flow until every step is done */}
      {!s.setupComplete && (
        <section className="x-card">
          <div className="x-card-head">
            <div>
              <h2 className="x-h2">How Xpense works</h2>
              <p className="x-card-sub">
                Four steps to take control of your money. {doneSteps} of 4 done.
              </p>
            </div>
          </div>
          <ol className="x-steps">
            {s.setupSteps.map((step, i) => {
              const action = STEP_ACTION[step.id];
              return (
                <li key={step.id} className={`x-step ${step.done ? 'is-done' : ''}`}>
                  <span className="x-step-num" aria-hidden="true">
                    {step.done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                  </span>
                  <div className="x-step-body">
                    <div className="x-step-title">{step.title}</div>
                    <p className="x-step-text">{step.description}</p>
                    {!step.done && (
                      <button type="button" className="x-link" onClick={() => runStep(action.key)}>
                        {action.label} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* This month at a glance */}
      <section className="x-metrics">
        <div className="x-metric">
          <span className="x-overline">Spent this month</span>
          <span className="x-metric-value">{formatINR(s.spentThisMonth)}</span>
          <span className="x-metric-note">
            {s.spentLastMonth > 0 ? `Last month: ${formatINR(s.spentLastMonth)}` : 'Your total spending so far'}
          </span>
        </div>
        <div className="x-metric">
          <span className="x-overline">Money in this month</span>
          <span className="x-metric-value x-text-brand">{formatINR(s.moneyInThisMonth)}</span>
          <span className="x-metric-note">{persona.copy.moneyInLabel}, gifts and other money received</span>
        </div>
        <div className="x-metric">
          <span className="x-overline">Daily average</span>
          <span className="x-metric-value">{formatINR(s.weekAverage)}</span>
          <span className="x-metric-note">What you spend on a typical day (last 7 days)</span>
        </div>
        <div className="x-metric">
          <span className="x-overline">Savings goals</span>
          <span className="x-metric-value">{s.activeGoals.length}</span>
          <span className="x-metric-note">
            {s.activeGoals.length > 0 ? `${formatINR(s.savedInGoals)} saved so far` : 'No goals yet'}
          </span>
        </div>
      </section>

      {/* Problems first, in plain words */}
      {s.budgetsNeedingAttention.length > 0 && (
        <div className="x-notice x-notice-warn" role="status">
          <AlertTriangle size={17} />
          <span>
            {s.budgetsNeedingAttention.length === 1
              ? `${s.budgetsNeedingAttention[0].name} is ${s.budgetsNeedingAttention[0].health.label.toLowerCase()}.`
              : `${s.budgetsNeedingAttention.length} budgets are running low.`}{' '}
            {s.budgetsNeedingAttention.length === 1 ? 'Add money to it' : 'Add money to them'} or spend a little less this week.
          </span>
        </div>
      )}

      <div className="x-grid-main">
        {/* Budgets */}
        <section className="x-card">
          <div className="x-card-head">
            <div>
              <h2 className="x-h2">Your budgets</h2>
              <p className="x-card-sub">What's left to spend in each part of your month</p>
            </div>
            <button type="button" className="x-link" onClick={() => onNavigate('wallets')}>
              Manage <ArrowRight size={14} />
            </button>
          </div>

          {s.budgets.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No budgets yet"
              text="Create a budget for food, travel or books so you always know what's left."
              action={
                <button type="button" className="x-btn x-btn-secondary" onClick={() => onNavigate('wallets')}>
                  <Plus size={16} /> Create a budget
                </button>
              }
            />
          ) : (
            <ul className="x-list">
              {s.budgets.map((b) => (
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

        <div className="x-stack">
          {/* Last 7 days */}
          <section className="x-card">
            <div className="x-card-head">
              <div>
                <h2 className="x-h2">Last 7 days</h2>
                <p className="x-card-sub">How much you spent each day</p>
              </div>
            </div>
            <div className="x-bars" role="img" aria-label="Spending for each of the last seven days">
              {s.last7Days.every((d) => d.amount === 0) && <div className="x-bars-empty">No spending in the last 7 days</div>}
              {s.safeToSpendToday > 0 && (
                <div className="x-bars-line" style={{ bottom: `calc(28px + (100% - 28px) * ${s.safeToSpendToday / maxBar})` }}>
                  <span>Safe daily amount</span>
                </div>
              )}
              {s.last7Days.map((d) => (
                <div key={d.label} className="x-bar-col" title={`${d.label}: ${formatINR(d.amount)}`}>
                  <div className="x-bar-track">
                    <div
                      className={`x-bar ${d.isToday ? 'is-today' : ''} ${d.amount > s.safeToSpendToday && s.safeToSpendToday > 0 ? 'is-over' : ''}`}
                      style={{ height: `${Math.max(d.amount > 0 ? 4 : 0, (d.amount / maxBar) * 100)}%` }}
                    />
                  </div>
                  <span className="x-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="x-card">
            <div className="x-card-head">
              <div>
                <h2 className="x-h2 x-inline-icon">
                  <Lightbulb size={17} /> Tips for you
                </h2>
              </div>
              <button type="button" className="x-link" onClick={() => onNavigate('analytics')}>
                Insights <ArrowRight size={14} />
              </button>
            </div>
            <ul className="x-tips">
              {s.tips.map((tip, i) => (
                <li key={i} className={`x-tip x-tip-${tip.tone}`}>
                  {tip.text}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Recent activity */}
      <section className="x-card">
        <div className="x-card-head">
          <div>
            <h2 className="x-h2">Recent activity</h2>
            <p className="x-card-sub">Your latest money in and money out</p>
          </div>
          <button type="button" className="x-link" onClick={() => onNavigate('transactions')}>
            See all <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={ArrowDownLeft}
            title="Nothing here yet"
            text="Add the money you received this month, then record your first expense."
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
    </div>
  );
}
