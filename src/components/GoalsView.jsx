import React, { useState } from 'react';
import { Plus, Trash2, PiggyBank, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPersonaConfig } from '../data/personas';
import { formatINR, formatLongDate, toNumber, toLocalISODate } from '../lib/format';
import PageHeader from './ui/PageHeader';
import Modal from './ui/Modal';
import AmountField from './ui/AmountField';
import CategoryIcon from './ui/CategoryIcon';
import ProgressBar from './ui/ProgressBar';
import EmptyState from './ui/EmptyState';

function monthsUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  return Math.max(1, months);
}

function celebrate() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  try {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ['#0b6b58', '#e6f2ee', '#14130f', '#d6d3c9'] });
  } catch {
    /* decorative only */
  }
}

function defaultDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return toLocalISODate(d);
}

export default function GoalsView({ user, goals = [], summary, onCreateGoal, onUpdateGoal, onContributeGoal, onDeleteGoal }) {
  const persona = getPersonaConfig(user?.account_type);
  const isPersonal = persona.id === 'personal';
  const notInBudget = summary?.notInBudget || 0;

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState(defaultDate());
  const [formError, setFormError] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [saving, setSaving] = useState(false);

  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const totalTarget = goals.reduce((s, g) => s + toNumber(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + toNumber(g.current_amount), 0);

  const openCreate = (idea) => {
    setTitle(idea?.title || '');
    setIsEmergency(isPersonal && /emergency/i.test(idea?.title || '') && !goals.some((g) => g.is_emergency));
    setTarget(idea ? String(idea.target) : '');
    setDate(defaultDate());
    setFormError('');
    setCreating(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) return setFormError('Give your goal a name.');
    if (toNumber(target) <= 0) return setFormError('Set how much you want to save.');
    setSaving(true);
    try {
      await onCreateGoal({
        title: title.trim(),
        target_amount: toNumber(target),
        target_date: date,
        category: 'Savings',
        ...(isPersonal ? { is_emergency: isEmergency } : {})
      });
      setCreating(false);
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openDeposit = (goal) => {
    const remaining = Math.max(0, toNumber(goal.target_amount) - toNumber(goal.current_amount));
    const suggestion = Math.min(remaining, notInBudget);
    setDepositAmount(suggestion > 0 ? String(Math.round(suggestion)) : '');
    setDepositError('');
    setDepositGoal(goal);
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    const amt = toNumber(depositAmount);
    if (amt <= 0) return setDepositError('Enter an amount greater than zero.');
    if (amt > notInBudget) {
      return setDepositError(
        notInBudget > 0
          ? `You only have ${formatINR(notInBudget)} that isn't in a budget yet.`
          : 'All your money is in budgets right now. Add money in first.'
      );
    }
    setSaving(true);
    try {
      const updated = await onContributeGoal(depositGoal.id, amt);
      const wasDone = toNumber(depositGoal.current_amount) >= toNumber(depositGoal.target_amount);
      const nowDone = updated && toNumber(updated.current_amount) >= toNumber(updated.target_amount);
      if (!wasDone && nowDone) celebrate();
      setDepositGoal(null);
    } catch (err) {
      setDepositError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="x-page">
      <PageHeader
        title={persona.copy.goalsTitle || 'Savings'}
        subtitle={persona.copy.goalsSubtitle}
        actions={
          <button type="button" className="x-btn x-btn-secondary" onClick={() => openCreate()}>
            <Plus size={16} /> New goal
          </button>
        }
      />

      <section className="x-summary-strip">
        <div className="x-summary-item">
          <span className="x-overline">Saved so far</span>
          <span className="x-summary-value x-display-sm">{formatINR(totalSaved)}</span>
          <span className="x-small x-muted">Across {goals.length} {goals.length === 1 ? 'goal' : 'goals'}</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Still to save</span>
          <span className="x-summary-value">{formatINR(Math.max(0, totalTarget - totalSaved))}</span>
          <span className="x-small x-muted">To reach every goal</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Available to save</span>
          <span className="x-summary-value">{formatINR(notInBudget)}</span>
          <span className="x-small x-muted">Money not in a budget yet</span>
        </div>
      </section>

      <div className="x-grid-main">
        <div className="x-stack">
          {goals.length === 0 ? (
            <div className="x-card">
              <EmptyState
                icon={PiggyBank}
                title="No savings goals yet"
                text="Pick an idea on the right or create your own goal."
                action={
                  <button type="button" className="x-btn x-btn-primary" onClick={() => openCreate()}>
                    <Plus size={16} /> Create a goal
                  </button>
                }
              />
            </div>
          ) : (
            goals.map((goal) => {
              const current = toNumber(goal.current_amount);
              const goalTarget = toNumber(goal.target_amount) || 1;
              const pct = Math.min(100, (current / goalTarget) * 100);
              const done = current >= goalTarget;
              const months = monthsUntil(goal.target_date);
              const perMonth = months ? Math.ceil((goalTarget - current) / months) : null;
              return (
                <article key={goal.id} className="x-card x-goal-card">
                  <div className="x-row-between">
                    <div className="x-inline">
                      <CategoryIcon category={goal.category} name={goal.title} />
                      <div>
                        <h3 className="x-h3 x-inline-icon">
                          {goal.title}
                          {done && <Check size={16} className="x-text-brand" />}
                        </h3>
                        <span className="x-small x-muted">
                          {goal.target_date ? `By ${formatLongDate(goal.target_date)}` : 'No deadline'}
                          {goal.is_emergency && <span className="x-tag">Emergency fund</span>}
                        </span>
                      </div>
                    </div>
                    <button type="button" className="x-icon-btn" onClick={() => setDeleting(goal)} aria-label={`Delete ${goal.title}`} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="x-goal-figure">
                    <span className="x-display-sm">{formatINR(current)}</span>
                    <span className="x-muted"> of {formatINR(goalTarget)}</span>
                  </div>
                  <ProgressBar value={pct} label={`${goal.title}: saved so far`} />
                  <div className="x-row-between x-small x-muted">
                    <span>{Math.floor(pct)}% saved</span>
                    <span>
                      {done
                        ? 'Goal reached'
                        : perMonth
                          ? `Save about ${formatINR(perMonth)} a month to get there`
                          : `${formatINR(goalTarget - current)} to go`}
                    </span>
                  </div>

                  {isPersonal && !goal.is_emergency && onUpdateGoal && (
                    <button type="button" className="x-link x-small x-self-start" onClick={() => onUpdateGoal(goal.id, { is_emergency: true })}>
                      Make this my emergency fund
                    </button>
                  )}
                  {!done && (
                    <button type="button" className="x-btn x-btn-secondary x-btn-block" onClick={() => openDeposit(goal)}>
                      <Plus size={16} /> Add savings
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>

        <section className="x-card x-self-start">
          <div className="x-card-head">
            <div>
              <h2 className="x-h2">Goal ideas</h2>
              <p className="x-card-sub">Popular goals to get you started</p>
            </div>
          </div>
          <ul className="x-list">
            {persona.goalIdeas.map((idea) => (
              <li key={idea.title}>
                <button type="button" className="x-idea" onClick={() => openCreate(idea)}>
                  <CategoryIcon category={idea.category} name={idea.title} size={36} />
                  <span className="x-tx-main">
                    <span className="x-row-title">{idea.title}</span>
                    <span className="x-small x-muted">{formatINR(idea.target)}</span>
                  </span>
                  <Plus size={16} className="x-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New savings goal" description="What are you saving for?">
        <form onSubmit={submitCreate} noValidate>
          <div className="x-field">
            <label className="x-label" htmlFor="goal-title">Goal name</label>
            <input id="goal-title" className="x-input" placeholder="e.g. Semester break trip" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <AmountField id="goal-target" label="How much do you need?" value={target} onChange={setTarget} />
          <div className="x-field">
            <label className="x-label" htmlFor="goal-date">When do you need it by?</label>
            <input id="goal-date" type="date" className="x-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {isPersonal && (
            <label className="x-check">
              <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
              <span>
                <span className="x-radio-title">This is my emergency fund</span>
                <span className="x-radio-sub">Your Home screen shows how many months of spending it covers.</span>
              </span>
            </label>
          )}
          {formError && <p className="x-error x-form-error" role="alert">{formError}</p>}
          <div className="x-form-actions">
            <button type="button" className="x-btn x-btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="x-spin" />}
              Create goal
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        title={`Add to ${depositGoal?.title || 'goal'}`}
        description="Savings come from money that isn't in a budget yet."
      >
        <form onSubmit={submitDeposit} noValidate>
          <AmountField
            id="goal-deposit"
            label="How much?"
            value={depositAmount}
            onChange={setDepositAmount}
            quick={[100, 500, 1000]}
            helper={`${formatINR(notInBudget)} available to save`}
          />
          {depositError && <p className="x-error x-form-error" role="alert">{depositError}</p>}
          <div className="x-form-actions">
            <button type="button" className="x-btn x-btn-ghost" onClick={() => setDepositGoal(null)}>Cancel</button>
            <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="x-spin" />}
              Save {toNumber(depositAmount) > 0 ? formatINR(depositAmount) : ''}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.title || 'goal'}?`}
        description={
          deleting && toNumber(deleting.current_amount) > 0
            ? `The ${formatINR(deleting.current_amount)} saved in it goes back to "Not in a budget yet".`
            : 'This removes the goal from your list.'
        }
        footer={
          <>
            <button type="button" className="x-btn x-btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button
              type="button"
              className="x-btn x-btn-danger"
              onClick={async () => {
                await onDeleteGoal(deleting.id);
                setDeleting(null);
              }}
            >
              Delete goal
            </button>
          </>
        }
      />
    </div>
  );
}
