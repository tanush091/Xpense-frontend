import React, { useEffect, useRef, useState } from 'react';
import { Store, QrCode, Send, Copy, Check, Info, Loader2, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';
import { MERCHANTS, RECIPIENTS } from '../data/demo';
import { formatINR, toNumber } from '../lib/format';
import PageHeader from './ui/PageHeader';
import AmountField from './ui/AmountField';
import CategoryIcon from './ui/CategoryIcon';

const TABS = [
  { id: 'pay', label: 'Pay a shop', icon: Store },
  { id: 'receive', label: 'Receive money', icon: QrCode },
  { id: 'send', label: 'Send to a friend', icon: Send }
];

function BudgetPicker({ wallets, value, onChange }) {
  if (wallets.length === 0) {
    return <p className="x-help">Create a budget first so payments have somewhere to come from.</p>;
  }
  return (
    <div className="x-choice-grid">
      {wallets.map((w) => (
        <label key={w.id} className={`x-choice ${value === w.id ? 'is-active' : ''} ${toNumber(w.balance) <= 0 ? 'is-muted' : ''}`}>
          <input type="radio" name="pay-wallet" checked={value === w.id} onChange={() => onChange(w.id)} />
          <CategoryIcon category={w.category} name={w.name} size={32} />
          <span className="x-choice-text">
            <span className="x-choice-title">{w.name}</span>
            <span className="x-choice-sub">{formatINR(w.balance)} left</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function usePayment(wallets, onRecord, notify) {
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!walletId && wallets.length) {
      setWalletId((wallets.find((w) => toNumber(w.balance) > 0) || wallets[0]).id);
    }
  }, [wallets, walletId]);

  const wallet = wallets.find((w) => w.id === walletId);
  const num = toNumber(amount);

  const validate = () => {
    if (num <= 0) return 'Enter an amount greater than zero.';
    if (!wallet) return 'Choose which budget to pay from.';
    if (num > toNumber(wallet.balance)) return `${wallet.name} only has ${formatINR(wallet.balance)} left.`;
    return '';
  };

  const submit = async (payload, successMessage) => {
    setBusy(true);
    setError('');
    try {
      await onRecord({ ...payload, amount: num, type: 'expense', category: wallet.category, wallet_id: wallet.id, wallet_name: wallet.name });
      notify(successMessage);
      setAmount('');
      return true;
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { amount, setAmount, walletId, setWalletId, wallet, num, error, setError, busy, validate, submit };
}

function PayShop({ wallets, onRecord, notify }) {
  const [merchant, setMerchant] = useState(MERCHANTS[0]);
  const [reviewing, setReviewing] = useState(false);
  const p = usePayment(wallets, onRecord, notify);

  const review = (e) => {
    e.preventDefault();
    const msg = p.validate();
    if (msg) return p.setError(msg);
    p.setError('');
    setReviewing(true);
  };

  if (reviewing) {
    const before = toNumber(p.wallet.balance);
    return (
      <div className="x-pay-review">
        <span className="x-overline">You're paying</span>
        <div className="x-display">{formatINR(p.num)}</div>
        <p className="x-muted">to {merchant.name}</p>
        <div className="x-before-after">
          <div>
            <span className="x-small x-muted">{p.wallet.name} now</span>
            <strong>{formatINR(before)}</strong>
          </div>
          <ArrowRight size={18} className="x-muted" />
          <div>
            <span className="x-small x-muted">After paying</span>
            <strong>{formatINR(before - p.num)}</strong>
          </div>
        </div>
        {p.error && <p className="x-error x-form-error" role="alert">{p.error}</p>}
        <div className="x-form-actions">
          <button type="button" className="x-btn x-btn-ghost" onClick={() => setReviewing(false)}>Back</button>
          <button
            type="button"
            className="x-btn x-btn-primary"
            disabled={p.busy}
            onClick={async () => {
              const ok = await p.submit(
                { title: merchant.name, merchant: merchant.name, payment_method: 'UPI QR' },
                `Paid ${formatINR(p.num)} to ${merchant.name}`
              );
              if (ok) setReviewing(false);
            }}
          >
            {p.busy && <Loader2 size={16} className="x-spin" />}
            Confirm and pay
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={review} noValidate>
      <fieldset className="x-field">
        <legend className="x-label">Which shop?</legend>
        <div className="x-chips">
          {MERCHANTS.map((m) => (
            <button key={m.id} type="button" className={`x-chip ${merchant.id === m.id ? 'is-active' : ''}`} onClick={() => setMerchant(m)}>
              {m.name}
            </button>
          ))}
        </div>
        <p className="x-help">{merchant.location}</p>
      </fieldset>
      <AmountField id="pay-amount" label="How much?" value={p.amount} onChange={p.setAmount} quick={[50, 100, 200]} />
      <fieldset className="x-field">
        <legend className="x-label">Pay from which budget?</legend>
        <BudgetPicker wallets={wallets} value={p.walletId} onChange={p.setWalletId} />
      </fieldset>
      {p.error && <p className="x-error x-form-error" role="alert">{p.error}</p>}
      <div className="x-form-actions">
        <button type="submit" className="x-btn x-btn-primary" disabled={wallets.length === 0}>Review payment</button>
      </div>
    </form>
  );
}

function SendFriend({ wallets, onRecord, notify }) {
  const [friend, setFriend] = useState(RECIPIENTS[0]);
  const p = usePayment(wallets, onRecord, notify);

  const send = async (e) => {
    e.preventDefault();
    const msg = p.validate();
    if (msg) return p.setError(msg);
    await p.submit(
      { title: `Sent to ${friend.name}`, recipient: friend.name, payment_method: 'UPI' },
      `Sent ${formatINR(p.num)} to ${friend.name}`
    );
  };

  return (
    <form onSubmit={send} noValidate>
      <fieldset className="x-field">
        <legend className="x-label">Who are you sending to?</legend>
        <div className="x-people">
          {RECIPIENTS.map((r) => (
            <button key={r.id} type="button" className={`x-person ${friend.id === r.id ? 'is-active' : ''}`} onClick={() => setFriend(r)} aria-pressed={friend.id === r.id}>
              <span className="x-avatar x-avatar-lg">{r.initial}</span>
              <span className="x-small">{r.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <AmountField id="send-amount" label="How much?" value={p.amount} onChange={p.setAmount} quick={[100, 250, 500]} />
      <fieldset className="x-field">
        <legend className="x-label">Send from which budget?</legend>
        <BudgetPicker wallets={wallets} value={p.walletId} onChange={p.setWalletId} />
      </fieldset>
      {p.error && <p className="x-error x-form-error" role="alert">{p.error}</p>}
      <div className="x-form-actions">
        <button type="submit" className="x-btn x-btn-primary" disabled={p.busy || wallets.length === 0}>
          {p.busy && <Loader2 size={16} className="x-spin" />}
          Send {p.num > 0 ? formatINR(p.num) : 'money'}
        </button>
      </div>
    </form>
  );
}

function ReceiveMoney({ user, onRecord, notify }) {
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);

  const upiId = user?.email || 'user@xpense.app';
  const name = user?.full_name || 'Xpense user';
  const num = toNumber(amount);
  const link = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${num > 0 ? `&am=${num}` : ''}&cu=INR`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, link, { width: 208, margin: 0, color: { dark: '#14130f', light: '#ffffff' } }, () => {});
  }, [link]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Couldn't copy the link. Please copy it manually.", 'error');
    }
  };

  const simulate = async () => {
    const value = num > 0 ? num : 500;
    setBusy(true);
    try {
      await onRecord({ title: 'Received via QR', amount: value, type: 'income', category: 'Income', payment_method: 'UPI QR' });
      notify(`${formatINR(value)} added. Put it into a budget from the Budgets page.`);
    } catch (err) {
      notify(err.message || 'Something went wrong.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="x-receive">
      <div className="x-qr-tile">
        <canvas ref={canvasRef} aria-label="Payment QR code" />
        <div className="x-qr-caption">
          <strong>{name}</strong>
          <span className="x-small x-muted x-mono">{upiId}</span>
        </div>
      </div>
      <div>
        <AmountField
          id="receive-amount"
          label="Ask for a specific amount (optional)"
          value={amount}
          onChange={setAmount}
          quick={[100, 500, 1000]}
          helper="The QR code updates as you type."
        />
        <div className="x-form-actions x-justify-start">
          <button type="button" className="x-btn x-btn-secondary" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy payment link'}
          </button>
          <button type="button" className="x-btn x-btn-ghost" onClick={simulate} disabled={busy}>
            {busy && <Loader2 size={16} className="x-spin" />}
            Try a practice payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsView({ user, wallets = [], onRecord, notify }) {
  const [tab, setTab] = useState('pay');

  return (
    <div className="x-page">
      <PageHeader title="Pay & receive" subtitle="Pay a shop, collect money with a QR code, or send money to a friend." />

      <div className="x-notice">
        <Info size={17} />
        <span>
          <strong>Practice mode.</strong> No real money moves. Payments here only update your balances in Xpense.
        </span>
      </div>

      <div className="x-segmented x-segmented-lg" role="tablist" aria-label="Payment type">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`x-seg ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <section className="x-card x-pay-card">
        {tab === 'pay' && <PayShop wallets={wallets} onRecord={onRecord} notify={notify} />}
        {tab === 'receive' && <ReceiveMoney user={user} onRecord={onRecord} notify={notify} />}
        {tab === 'send' && <SendFriend wallets={wallets} onRecord={onRecord} notify={notify} />}
      </section>
    </div>
  );
}
