import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarClock, Loader2 } from 'lucide-react';
import { formatINR, formatLongDate, toNumber, toLocalISODate } from '../../lib/format';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import AmountField from '../../components/ui/AmountField';
import CategoryIcon from '../../components/ui/CategoryIcon';
import EmptyState from '../../components/ui/EmptyState';
import { BillStatusBadge, PayBillDialog } from './BillParts';

const PRESETS = [
  { name: 'Rent', amount: 15000 },
  { name: 'Electricity', amount: 1500 },
  { name: 'Phone', amount: 599 },
  { name: 'Internet', amount: 799 },
  { name: 'Water', amount: 400 },
  { name: 'Streaming', amount: 499 }
];
const FREQUENCY_LABEL = { weekly: 'Every week', monthly: 'Every month', yearly: 'Every year' };
const PER_MONTH = { weekly: 52 / 12, monthly: 1, yearly: 1 / 12 };

function nextMonthDay() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return toLocalISODate(d);
}

function BillForm({ initial, wallets, onCancel, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [amount, setAmount] = useState(initial ? String(toNumber(initial.amount)) : '');
  const [frequency, setFrequency] = useState(initial?.frequency || 'monthly');
  const [due, setDue] = useState(initial?.next_due_date || nextMonthDay());
  const billsBudget = wallets.find((w) => /housing|bill|rent|utilit/i.test(`${w.category} ${w.name}`));
  const [walletId, setWalletId] = useState(initial?.wallet_id ?? (billsBudget || wallets[0])?.id ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Give the bill a name, like Rent or Electricity.');
    if (toNumber(amount) <= 0) return setError('Enter how much the bill is.');
    if (!due) return setError('Choose when the bill is next due.');
    setSaving(true);
    try {
      await onSave({ name: name.trim(), amount: toNumber(amount), frequency, next_due_date: due, wallet_id: walletId || '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {!initial && (
        <div className="x-field">
          <span className="x-label">Quick start</span>
          <div className="x-chips">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`x-chip ${name === p.name ? 'is-active' : ''}`}
                onClick={() => {
                  setName(p.name);
                  setAmount(String(p.amount));
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="x-field">
        <label className="x-label" htmlFor="bill-name">Bill name</label>
        <input id="bill-name" className="x-input" placeholder="e.g. Rent" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <AmountField id="bill-amount" label="How much is it?" value={amount} onChange={setAmount} />
      <fieldset className="x-field">
        <legend className="x-label">How often?</legend>
        <div className="x-segmented">
          {Object.keys(FREQUENCY_LABEL).map((f) => (
            <button key={f} type="button" className={`x-seg ${frequency === f ? 'is-active' : ''}`} onClick={() => setFrequency(f)} aria-pressed={frequency === f}>
              {FREQUENCY_LABEL[f]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="x-field">
        <label className="x-label" htmlFor="bill-due">Next due date</label>
        <input id="bill-due" type="date" className="x-input" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
      <div className="x-field">
        <label className="x-label" htmlFor="bill-wallet">Pay it from</label>
        <select id="bill-wallet" className="x-input" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>{w.name} ({formatINR(w.balance)} left)</option>
          ))}
          <option value="">Money not in a budget</option>
        </select>
        <p className="x-help">When you mark the bill as paid, the money comes out of here.</p>
      </div>
      {error && <p className="x-error x-form-error" role="alert">{error}</p>}
      <div className="x-form-actions">
        <button type="button" className="x-btn x-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
          {saving && <Loader2 size={16} className="x-spin" />}
          {initial ? 'Save changes' : 'Add bill'}
        </button>
      </div>
    </form>
  );
}

export default function BillsView({ summary, wallets = [], onCreateBill, onUpdateBill, onDeleteBill, onPayBill }) {
  const bills = summary?.bills || [];
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [paying, setPaying] = useState(null);

  const perMonth = bills.reduce((t, b) => t + toNumber(b.amount) * (PER_MONTH[b.frequency] || 1), 0);
  const walletFor = (id) => wallets.find((w) => w.id === id);


  return (
    <div className="x-page">
      <PageHeader
        title="Bills"
        subtitle="Rent, electricity, phone and anything else you pay regularly. Mark a bill as paid and Xpense records it for you."
        actions={
          <button type="button" className="x-btn x-btn-secondary" onClick={() => setCreating(true)}>
            <Plus size={16} /> New bill
          </button>
        }
      />

      <section className="x-summary-strip">
        <div className="x-summary-item">
          <span className="x-overline">Still to pay this month</span>
          <span className="x-summary-value">{formatINR(summary?.billsStillToPay)}</span>
          <span className="x-small x-muted">Including anything overdue</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Paid this month</span>
          <span className="x-summary-value x-text-brand">{formatINR(summary?.billsPaid)}</span>
          <span className="x-small x-muted">Bills marked as paid</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Bills per month</span>
          <span className="x-summary-value">{formatINR(Math.round(perMonth))}</span>
          <span className="x-small x-muted">Weekly and yearly bills counted per month</span>
        </div>
      </section>

      <div className="x-card x-card-flush">
        {bills.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No bills yet"
            text="Add the bills you pay every month, like rent and electricity."
            action={
              <button type="button" className="x-btn x-btn-primary" onClick={() => setCreating(true)}>
                <Plus size={16} /> Add your first bill
              </button>
            }
          />
        ) : (
          <ul className="x-list">
            {bills.map((b) => (
              <li key={b.id} className="x-tx-row x-bill-row x-bill-page-row">
                <CategoryIcon category="bill" name={b.name} size={38} />
                <div className="x-tx-main">
                  <span className="x-row-title">{b.name}</span>
                  <span className="x-small x-muted">
                    {FREQUENCY_LABEL[b.frequency] || 'Every month'} · from {walletFor(b.wallet_id)?.name || 'money not in a budget'}
                    {b.last_paid_date ? ` · last paid ${formatLongDate(b.last_paid_date)}` : ''}
                  </span>
                </div>
                <div className="x-bill-side">
                  <span className="x-amount-cell">{formatINR(b.amount)}</span>
                  <BillStatusBadge status={b.status} />
                </div>
                <div className="x-inline x-gap-0">
                  <button type="button" className="x-btn x-btn-secondary x-btn-sm" onClick={() => setPaying(b)}>
                    Mark as paid
                  </button>
                  <button type="button" className="x-icon-btn" onClick={() => setEditing(b)} aria-label={`Edit ${b.name}`} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="x-icon-btn" onClick={() => setDeleting(b)} aria-label={`Delete ${b.name}`} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New bill" description="A bill you pay again and again.">
        {creating && (
          <BillForm
            wallets={wallets}
            onCancel={() => setCreating(false)}
            onSave={async (data) => {
              await onCreateBill(data);
              setCreating(false);
            }}
          />
        )}
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${editing?.name || 'bill'}`}>
        {editing && (
          <BillForm
            initial={editing}
            wallets={wallets}
            onCancel={() => setEditing(null)}
            onSave={async (data) => {
              await onUpdateBill(editing.id, data);
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <PayBillDialog
        bill={paying}
        wallets={wallets}
        notInBudget={summary?.notInBudget || 0}
        onClose={() => setPaying(null)}
        onPay={onPayBill}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Remove ${deleting?.name || 'bill'}?`}
        description="It won't show up as due any more. Past payments stay in Activity."
        footer={
          <>
            <button type="button" className="x-btn x-btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button
              type="button"
              className="x-btn x-btn-danger"
              onClick={async () => {
                await onDeleteBill(deleting.id);
                setDeleting(null);
              }}
            >
              Remove bill
            </button>
          </>
        }
      />
    </div>
  );
}
