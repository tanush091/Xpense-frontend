import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import AmountField from './ui/AmountField';
import { formatINR, toNumber } from '../lib/format';

/**
 * Put money into a budget. Two honest sources:
 *   "available" — move money you already added but haven't budgeted (total stays the same)
 *   "new"       — money that just arrived and goes straight into this budget (total grows)
 */
export default function AddMoneyToBudgetModal({ wallet, notInBudget = 0, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('available');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    const gap = Math.max(0, toNumber(wallet.budget_limit) - toNumber(wallet.balance));
    const suggestion = notInBudget > 0 ? Math.min(gap || notInBudget, notInBudget) : gap;
    setAmount(suggestion > 0 ? String(Math.round(suggestion)) : '');
    setSource(notInBudget > 0 ? 'available' : 'new');
    setError('');
  }, [wallet, notInBudget]);

  if (!wallet) return null;
  const num = toNumber(amount);
  const fromAvailable = source === 'available';
  const tooMuch = fromAvailable && num > notInBudget;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (num <= 0) return setError('Enter an amount greater than zero.');
    if (tooMuch) return setError(`You only have ${formatINR(notInBudget)} that isn't in a budget yet.`);
    setSaving(true);
    try {
      await onSubmit(wallet.id, num, fromAvailable);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Add money to ${wallet.name}`}
      description={`${formatINR(wallet.balance)} left of ${formatINR(wallet.budget_limit)} this month.`}
    >
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="x-field">
          <legend className="x-label">Where is the money coming from?</legend>
          <div className="x-radio-list">
            <label className={`x-radio ${fromAvailable ? 'is-active' : ''} ${notInBudget <= 0 ? 'is-disabled' : ''}`}>
              <input
                type="radio"
                name="source"
                checked={fromAvailable}
                disabled={notInBudget <= 0}
                onChange={() => setSource('available')}
              />
              <span>
                <span className="x-radio-title">Money not in a budget yet</span>
                <span className="x-radio-sub">
                  {notInBudget > 0 ? `${formatINR(notInBudget)} available to move` : 'Nothing available — add money in first'}
                </span>
              </span>
            </label>
            <label className={`x-radio ${!fromAvailable ? 'is-active' : ''}`}>
              <input type="radio" name="source" checked={!fromAvailable} onChange={() => setSource('new')} />
              <span>
                <span className="x-radio-title">New money I just received</span>
                <span className="x-radio-sub">Adds to your total and goes straight into this budget</span>
              </span>
            </label>
          </div>
        </fieldset>

        <AmountField
          id="budget-add-amount"
          label="How much?"
          value={amount}
          onChange={setAmount}
          quick={[100, 500, 1000]}
          error={tooMuch ? `More than the ${formatINR(notInBudget)} available.` : ''}
        />

        {error && !tooMuch && <p className="x-error x-form-error" role="alert">{error}</p>}

        <div className="x-form-actions">
          <button type="button" className="x-btn x-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
            {saving && <Loader2 size={16} className="x-spin" />}
            Add {num > 0 ? formatINR(num) : 'money'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
