import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from './ui/Modal';
import { getPersonaConfig } from '../data/personas';
import { initialsOf } from './AppSidebar';

const ACCOUNT_TYPES = [
  { value: 'Student Account', title: 'Student', text: 'Pocket money, canteen, travel and semester savings' },
  { value: 'Personal Account', title: 'Personal', text: 'Salary, household bills and family savings' },
  { value: 'Corporate SaaS', title: 'Business', text: 'Company spending, tax set-aside and payees' }
];

/** Switch between accounts saved on this device, or add another one. */
export default function AccountSwapperModal({
  isOpen,
  onClose,
  currentUser,
  savedAccounts = [],
  onSwitchAccount,
  onRemoveAccount,
  onAddNewAccount
}) {
  const [busyEmail, setBusyEmail] = useState(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('Personal Account');
  const [submitting, setSubmitting] = useState(false);
  const [signInTarget, setSignInTarget] = useState(null); // a listed account that needs its password

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setAdding(false);
    setSignInTarget(null);
    setPassword('');
  }, [isOpen]);

  const current = (currentUser?.email || '').toLowerCase();
  const others = savedAccounts.filter((a) => a.email.toLowerCase() !== current);
  const currentPersona = getPersonaConfig(currentUser?.account_type);

  const startSignIn = (accountEmail) => {
    setAdding(true);
    setMode('login');
    setEmail(accountEmail || '');
    setSignInTarget(accountEmail ? savedAccounts.find((a) => a.email === accountEmail) || null : null);
    setPassword('');
    setError('');
  };

  const switchTo = async (acc) => {
    if (!acc.token) return startSignIn(acc.email);
    setBusyEmail(acc.email);
    setError('');
    try {
      await onSwitchAccount(acc.email);
      onClose();
    } catch (err) {
      if (err.needsPassword) {
        startSignIn(acc.email);
        setError('Your saved sign-in for this account has expired. Enter the password to continue.');
      } else {
        setError(err.message || 'Could not switch account.');
      }
    } finally {
      setBusyEmail(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Enter the email and password.');
    if (mode === 'signup' && !fullName.trim()) return setError('Enter the full name.');
    setSubmitting(true);
    try {
      await onAddNewAccount({ mode, email: email.trim(), password, fullName: fullName.trim(), accountType });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check the details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Switch account" description="Each account has its own dashboard, budgets and data.">
      <div className="x-acc-current">
        <span className="x-avatar">{initialsOf(currentUser)}</span>
        <span className="x-acc-text">
          <span className="x-row-title">{currentUser?.full_name || currentUser?.email}</span>
          <span className="x-small x-muted">{currentUser?.email}</span>
        </span>
        <span className="x-tag">{currentPersona.accountLabel}</span>
      </div>

      {others.length > 0 && (
        <div className="x-field">
          <span className="x-label">Other accounts on this device</span>
          <ul className="x-list x-acc-list">
            {others.map((acc) => {
              const persona = getPersonaConfig(acc.accountType);
              return (
                <li key={acc.email} className="x-acc-row">
                  <span className="x-avatar">{initialsOf({ full_name: acc.fullName, email: acc.email })}</span>
                  <span className="x-acc-text">
                    <span className="x-row-title">{acc.fullName || acc.email}</span>
                    <span className="x-small x-muted">
                      {persona.accountLabel} · {acc.email}
                    </span>
                  </span>
                  <button type="button" className="x-btn x-btn-secondary x-btn-sm" onClick={() => switchTo(acc)} disabled={busyEmail === acc.email}>
                    {busyEmail === acc.email && <Loader2 size={14} className="x-spin" />}
                    {acc.token ? 'Switch' : 'Sign in'}
                  </button>
                  <button
                    type="button"
                    className="x-icon-btn"
                    onClick={() => onRemoveAccount(acc.email)}
                    aria-label={`Remove ${acc.email} from this device`}
                    title="Remove from this device"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="x-error x-form-error" role="alert">{error}</p>}

      {!adding ? (
        <button type="button" className="x-btn x-btn-secondary x-btn-block" onClick={() => startSignIn('')}>
          <Plus size={16} /> Add another account
        </button>
      ) : (
        <form onSubmit={submit} noValidate className="x-acc-form">
          {signInTarget ? (
            <h3 className="x-h3 x-acc-form-title">Sign in to {signInTarget.fullName || signInTarget.email}</h3>
          ) : (
          <div className="x-segmented x-segmented-full">
            <button type="button" className={`x-seg ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>
              Sign in
            </button>
            <button type="button" className={`x-seg ${mode === 'signup' ? 'is-active' : ''}`} onClick={() => setMode('signup')}>
              Create account
            </button>
          </div>
          )}
          {mode === 'signup' && !signInTarget && (
            <>
              <div className="x-field">
                <label className="x-label" htmlFor="acc-name">Full name</label>
                <input id="acc-name" className="x-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <fieldset className="x-field">
                <legend className="x-label">Who is this account for?</legend>
                <div className="x-radio-list">
                  {ACCOUNT_TYPES.map((t) => (
                    <label key={t.value} className={`x-radio ${accountType === t.value ? 'is-active' : ''}`}>
                      <input type="radio" name="acc-type" checked={accountType === t.value} onChange={() => setAccountType(t.value)} />
                      <span>
                        <span className="x-radio-title">{t.title}</span>
                        <span className="x-radio-sub">{t.text}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div className="x-field">
            <label className="x-label" htmlFor="acc-email">Email</label>
            <input
              id="acc-email"
              type="email"
              className="x-input"
              value={email}
              readOnly={Boolean(signInTarget)}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="x-field">
            <label className="x-label" htmlFor="acc-password">Password</label>
            <input
              id="acc-password"
              type="password"
              className="x-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <div className="x-form-actions">
            <button type="button" className="x-btn x-btn-ghost" onClick={() => { setAdding(false); setSignInTarget(null); }}>Cancel</button>
            <button type="submit" className="x-btn x-btn-primary" disabled={submitting}>
              {submitting && <Loader2 size={16} className="x-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
