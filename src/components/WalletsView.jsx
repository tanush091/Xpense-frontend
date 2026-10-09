import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, Loader2, ArrowDownLeft } from 'lucide-react';
import { getPersonaConfig } from '../data/personas';
import { formatINR, toNumber } from '../lib/format';
import PageHeader from './ui/PageHeader';
import Modal from './ui/Modal';
import AmountField from './ui/AmountField';
import CategoryIcon from './ui/CategoryIcon';
import HealthBadge from './ui/HealthBadge';
import ProgressBar from './ui/ProgressBar';
import EmptyState from './ui/EmptyState';

const HEALTH_TONE = { good: 'brand', low: 'warn', empty: 'danger', unfunded: 'brand' };

function BudgetForm({ initial, categories, presets, notInBudget, onCancel, onSave, isNew }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || categories[0]);
  const [limit, setLimit] = useState(initial ? String(Math.round(toNumber(initial.budget_limit))) : '');
  const [startWith, setStartWith] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Give this budget a name.');
    if (toNumber(limit) <= 0) return setError('Set how much you plan to spend each month.');
    if (toNumber(startWith) > notInBudget) {
      return setError(`You only have ${formatINR(notInBudget)} that isn't in a budget yet.`);
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category, budget_limit: toNumber(limit) }, toNumber(startWith));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {isNew && presets.length > 0 && (
        <div className="x-field">
          <span className="x-label">Quick start</span>
          <div className="x-chips">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`x-chip ${name === p.name ? 'is-active' : ''}`}
                onClick={() => {
                  setName(p.name);
                  setCategory(p.category);
                  setLimit(String(p.budget_limit));
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="x-field">
        <label className="x-label" htmlFor="budget-name">Name</label>
        <input
          id="budget-name"
          className="x-input"
          placeholder="e.g. Food & canteen"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="x-field">
        <label className="x-label" htmlFor="budget-category">What is it for?</label>
        <select id="budget-category" className="x-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <AmountField
        id="budget-limit"
        label="Monthly limit"
        helper="The most you want to spend on this in a month."
        value={limit}
        onChange={setLimit}
      />

      {isNew && (
        <AmountField
          id="budget-start"
          label="Put money in now (optional)"
          helper={
            notInBudget > 0
              ? `Moves money from the ${formatINR(notInBudget)} that isn't in a budget yet.`
              : 'Add money in first, then you can fill this budget.'
          }
          value={startWith}
          onChange={setStartWith}
          max={notInBudget}
        />
      )}

      {error && <p className="x-error x-form-error" role="alert">{error}</p>}

      <div className="x-form-actions">
        <button type="button" className="x-btn x-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
          {saving && <Loader2 size={16} className="x-spin" />}
          {isNew ? 'Create budget' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default function WalletsView({
  user,
  summary,
  onCreateBudget,
  onUpdateWallet,
  onDeleteWallet,
  onOpenAddMoney,
  onAddMoneyIn
}) {
  const persona = getPersonaConfig(user?.account_type);
  const categories = [...persona.categories, 'Other'];
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const budgets = summary?.budgets || [];
  const notInBudget = summary?.notInBudget || 0;

  return (
    <div className="x-page">
      <PageHeader
        title="Budgets"
        subtitle="Split your money into budgets so you always know what's left for food, travel, books and fun."
        actions={
          <button type="button" className="x-btn x-btn-secondary" onClick={() => setCreating(true)}>
            <Plus size={16} /> New budget
          </button>
        }
      />

      <section className="x-summary-strip">
        <div className="x-summary-item">
          <span className="x-overline">Not in a budget yet</span>
          <span className="x-summary-value">{formatINR(notInBudget)}</span>
          <span className="x-small x-muted">
            {notInBudget > 0 ? 'Use "Add money" on a budget to move it in.' : 'Everything you have is already budgeted.'}
          </span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">In your budgets</span>
          <span className="x-summary-value">{formatINR(summary?.inBudgets)}</span>
          <span className="x-small x-muted">Ready to spend</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Monthly plan</span>
          <span className="x-summary-value">{formatINR(summary?.monthlyPlan)}</span>
          <span className="x-small x-muted">All your monthly limits added up</span>
        </div>
      </section>

      {notInBudget <= 0 && budgets.length > 0 && summary?.inBudgets <= 0 && (
        <div className="x-notice">
          <ArrowDownLeft size={17} />
          <span>Your budgets are empty. Add the money you received this month, then move it into your budgets.</span>
          <button type="button" className="x-link" onClick={onAddMoneyIn}>Add money in</button>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="x-card">
          <EmptyState
            icon={Wallet}
            title="No budgets yet"
            text="Create your first budget, like Food & canteen or Travel, to start planning your month."
            action={
              <button type="button" className="x-btn x-btn-primary" onClick={() => setCreating(true)}>
                <Plus size={16} /> Create your first budget
              </button>
            }
          />
        </div>
      ) : (
        <div className="x-budget-grid">
          {budgets.map((b) => {
            const spent = Math.max(0, b.limit - b.left);
            return (
              <article key={b.id} className="x-card x-budget-card">
                <div className="x-row-between">
                  <div className="x-inline">
                    <CategoryIcon category={b.category} name={b.name} />
                    <div>
                      <h3 className="x-h3">{b.name}</h3>
                      <span className="x-small x-muted">{b.category}</span>
                    </div>
                  </div>
                  <div className="x-inline x-gap-0">
                    <button type="button" className="x-icon-btn" onClick={() => setEditing(b)} aria-label={`Edit ${b.name}`} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="x-icon-btn" onClick={() => setDeleting(b)} aria-label={`Delete ${b.name}`} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="x-budget-figure">
                  <span className="x-budget-left">{formatINR(b.left)}</span>
                  <span className="x-muted"> left of {formatINR(b.limit)}</span>
                </div>
                <ProgressBar value={b.limit > 0 ? (b.left / b.limit) * 100 : 0} tone={HEALTH_TONE[b.health.key]} label={`${b.name}: money left`} />
                <div className="x-row-between x-small">
                  <HealthBadge health={b.health} />
                  <span className="x-muted">{spent > 0 ? `${formatINR(spent)} used` : 'Nothing used yet'}</span>
                </div>

                <button type="button" className="x-btn x-btn-secondary x-btn-block" onClick={() => onOpenAddMoney(b)}>
                  <Plus size={16} /> Add money
                </button>
              </article>
            );
          })}
        </div>
      )}

      <p className="x-small x-muted x-center">
        On track means at least 30% is left. Running low means 10–29%. Almost empty means under 10%. Not filled yet means no money has gone in this month.
      </p>

      <Modal open={creating} onClose={() => setCreating(false)} title="New budget" description="A budget is money set aside for one part of your life.">
        {creating && (
          <BudgetForm
            isNew
            categories={categories}
            presets={persona.defaultWallets}
            notInBudget={notInBudget}
            onCancel={() => setCreating(false)}
            onSave={async (data, startWith) => {
              await onCreateBudget(data, startWith);
              setCreating(false);
            }}
          />
        )}
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${editing?.name || 'budget'}`}>
        {editing && (
          <BudgetForm
            initial={editing}
            categories={categories.includes(editing.category) ? categories : [editing.category, ...categories]}
            presets={[]}
            notInBudget={notInBudget}
            onCancel={() => setEditing(null)}
            onSave={async (data) => {
              await onUpdateWallet(editing.id, data);
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name || 'budget'}?`}
        description={
          deleting && deleting.left > 0
            ? `The ${formatINR(deleting.left)} left in it will move back to "Not in a budget yet". Your past expenses stay in Activity.`
            : 'Your past expenses stay in Activity.'
        }
        footer={
          <>
            <button type="button" className="x-btn x-btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button
              type="button"
              className="x-btn x-btn-danger"
              onClick={async () => {
                await onDeleteWallet(deleting.id);
                setDeleting(null);
              }}
            >
              Delete budget
            </button>
          </>
        }
      />
    </div>
  );
}
