import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import AmountField from './ui/AmountField';
import CategoryIcon from './ui/CategoryIcon';
import { formatINR, toNumber } from '../lib/format';

const METHODS = ['UPI', 'Cash', 'Card'];

/**
 * One form for both directions:
 *   mode "expense" — money out, always taken from one budget
 *   mode "income"  — money in, lands in "not in a budget yet"
 */
export default function AddTransactionModal({
  isOpen,
  mode = 'expense',
  onClose,
  wallets = [],
  defaultWalletId,
  incomeExamples = [],
  expenseQuick = [50, 100, 200, 500],
  incomeQuick = [1000, 2000, 5000, 10000],
  onSubmit
}) {
  const isExpense = mode === 'expense';
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [method, setMethod] = useState('UPI');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    setTitle(isExpense ? '' : incomeExamples[0] || '');
    setMethod('UPI');
    setError('');
    const withMoney = wallets.find((w) => toNumber(w.balance) > 0);
    setWalletId(defaultWalletId || withMoney?.id || wallets[0]?.id || '');
  }, [isOpen, isExpense, defaultWalletId]); // eslint-disable-line react-hooks/exhaustive-deps

  const wallet = wallets.find((w) => w.id === walletId);
  const num = toNumber(amount);
  const tooMuch = isExpense && wallet && num > toNumber(wallet.balance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (num <= 0) return setError('Enter an amount greater than zero.');
    if (!title.trim()) return setError(isExpense ? 'Say what this was for.' : 'Say where this money came from.');
    if (isExpense && !wallet) return setError('Choose which budget this comes out of.');
    if (tooMuch) {
      return setError(`${wallet.name} only has ${formatINR(wallet.balance)} left. Add money to it first or pick another budget.`);
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        amount: num,
        type: isExpense ? 'expense' : 'income',
        category: isExpense ? wallet.category : 'Income',
        wallet_id: isExpense ? wallet.id : null,
        wallet_name: isExpense ? wallet.name : null,
        payment_method: method
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isExpense ? 'Add an expense' : 'Add money in'}
      description={
        isExpense
          ? 'Record something you paid for. It comes out of one of your budgets.'
          : 'Record money you received. You can put it into budgets afterwards.'
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AmountField
          id="tx-amount"
          label="How much?"
          value={amount}
          onChange={setAmount}
          quick={isExpense ? expenseQuick : incomeQuick}
          error={tooMuch ? `More than the ${formatINR(wallet.balance)} left in ${wallet.name}.` : ''}
          autoFocus
        />

        <div className="x-field">
          <label className="x-label" htmlFor="tx-title">{isExpense ? 'What was it for?' : 'Where did it come from?'}</label>
          <input
            id="tx-title"
            className="x-input"
            placeholder={isExpense ? 'e.g. Lunch at canteen, Metro card, Notebook' : 'e.g. Pocket money from home'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {!isExpense && incomeExamples.length > 0 && (
            <div className="x-chips">
              {incomeExamples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className={`x-chip ${title === ex ? 'is-active' : ''}`}
                  onClick={() => setTitle(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {isExpense && (
          <fieldset className="x-field">
            <legend className="x-label">Take it from which budget?</legend>
            {wallets.length === 0 ? (
              <p className="x-help">You don't have any budgets yet. Create one on the Budgets page first.</p>
            ) : (
              <div className="x-choice-grid">
                {wallets.map((w) => {
                  const empty = toNumber(w.balance) <= 0;
                  return (
                    <label key={w.id} className={`x-choice ${walletId === w.id ? 'is-active' : ''} ${empty ? 'is-muted' : ''}`}>
                      <input
                        type="radio"
                        name="tx-wallet"
                        value={w.id}
                        checked={walletId === w.id}
                        onChange={() => setWalletId(w.id)}
                      />
                      <CategoryIcon category={w.category} name={w.name} size={32} />
                      <span className="x-choice-text">
                        <span className="x-choice-title">{w.name}</span>
                        <span className="x-choice-sub">{formatINR(w.balance)} left</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        )}

        <fieldset className="x-field">
          <legend className="x-label">{isExpense ? 'How did you pay?' : 'How did you receive it?'}</legend>
          <div className="x-segmented">
            {METHODS.concat(isExpense ? [] : ['Bank transfer']).map((m) => (
              <button
                key={m}
                type="button"
                className={`x-seg ${method === m ? 'is-active' : ''}`}
                onClick={() => setMethod(m)}
                aria-pressed={method === m}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="x-error x-form-error" role="alert">{error}</p>}

        <div className="x-form-actions">
          <button type="button" className="x-btn x-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="x-btn x-btn-primary" disabled={saving || (isExpense && wallets.length === 0)}>
            {saving && <Loader2 size={16} className="x-spin" />}
            {isExpense ? 'Save expense' : 'Save money in'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
