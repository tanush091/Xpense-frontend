import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, LogOut } from 'lucide-react';
import { getPersonaConfig } from '../data/personas';
import PageHeader from './ui/PageHeader';

export default function SettingsView({ user, onUpdateProfile, onSignOut, notify }) {
  const persona = getPersonaConfig(user?.account_type);
  const isStudent = persona.id === 'student';
  const isBusiness = persona.id === 'corporate';
  const [form, setForm] = useState({
    full_name: '',
    university: '',
    semester: '',
    student_id: '',
    business_name: '',
    tax_reserve_percent: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || '',
      university: user?.university || '',
      semester: user?.semester || '',
      student_id: user?.student_id && user.student_id !== user.email ? user.student_id : '',
      business_name: user?.business_name || '',
      tax_reserve_percent: user?.tax_reserve_percent ? String(Number(user.tax_reserve_percent)) : ''
    });
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return notify('Your name cannot be empty.', 'error');
    const tax = form.tax_reserve_percent === '' ? 0 : Number(form.tax_reserve_percent);
    if (isBusiness && (Number.isNaN(tax) || tax < 0 || tax > 60)) {
      return notify('Tax to set aside must be between 0% and 60%.', 'error');
    }
    setSaving(true);
    try {
      const updates = { full_name: form.full_name.trim() };
      if (isStudent) Object.assign(updates, { university: form.university, semester: form.semester, student_id: form.student_id });
      if (isBusiness) Object.assign(updates, { business_name: form.business_name, tax_reserve_percent: tax });
      await onUpdateProfile(updates);
      notify('Settings saved');
    } catch (err) {
      notify(err.message || "Couldn't save your settings.", 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="x-page x-page-narrow">
      <PageHeader title="Settings" subtitle="Your profile and account details." />

      <form className="x-card" onSubmit={save} noValidate>
        <div className="x-card-head">
          <div>
            <h2 className="x-h2">Profile</h2>
            <p className="x-card-sub">This is how you appear in Xpense.</p>
          </div>
        </div>

        <div className="x-form-grid">
          <div className="x-field">
            <label className="x-label" htmlFor="set-name">Full name</label>
            <input id="set-name" className="x-input" value={form.full_name} onChange={set('full_name')} />
          </div>
          <div className="x-field">
            <label className="x-label" htmlFor="set-email">Email</label>
            <input id="set-email" className="x-input" value={user?.email || ''} readOnly aria-describedby="set-email-help" />
            <p id="set-email-help" className="x-help">Used to sign in. It can't be changed here.</p>
          </div>
          {isStudent && (
            <>
              <div className="x-field">
                <label className="x-label" htmlFor="set-college">College or university</label>
                <input id="set-college" className="x-input" placeholder="e.g. SASTRA University" value={form.university} onChange={set('university')} />
              </div>
              <div className="x-field">
                <label className="x-label" htmlFor="set-sem">Year or semester</label>
                <input id="set-sem" className="x-input" placeholder="e.g. Semester 4" value={form.semester} onChange={set('semester')} />
              </div>
              <div className="x-field">
                <label className="x-label" htmlFor="set-roll">Roll number (optional)</label>
                <input id="set-roll" className="x-input" value={form.student_id} onChange={set('student_id')} />
              </div>
            </>
          )}
          {isBusiness && (
            <>
              <div className="x-field">
                <label className="x-label" htmlFor="set-business">Business name</label>
                <input id="set-business" className="x-input" placeholder="e.g. Nair Design Studio" value={form.business_name} onChange={set('business_name')} />
              </div>
              <div className="x-field">
                <label className="x-label" htmlFor="set-tax">Tax to set aside (%)</label>
                <input
                  id="set-tax"
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  className="x-input"
                  placeholder="e.g. 18"
                  value={form.tax_reserve_percent}
                  onChange={set('tax_reserve_percent')}
                  aria-describedby="set-tax-help"
                />
                <p id="set-tax-help" className="x-help">
                  The share of money coming in that you keep aside for tax. Your Overview shows if you've set aside enough.
                </p>
              </div>
            </>
          )}
          <div className="x-field">
            <label className="x-label" htmlFor="set-currency">Currency</label>
            <input id="set-currency" className="x-input" value="Indian Rupee (₹)" readOnly />
          </div>
        </div>

        <div className="x-form-actions">
          <button type="submit" className="x-btn x-btn-primary" disabled={saving}>
            {saving && <Loader2 size={16} className="x-spin" />}
            Save settings
          </button>
        </div>
      </form>

      <section className="x-card">
        <div className="x-card-head">
          <div>
            <h2 className="x-h2">Account</h2>
          </div>
        </div>
        <dl className="x-detail">
          <div><dt>Account type</dt><dd>{persona.accountLabel}</dd></div>
        </dl>
        <p className="x-help">
          Each account type has its own dashboard, budgets and goals. To try a different type, use "Switch account" and create a
          new profile.
        </p>
      </section>

      <section className="x-card">
        <div className="x-inline x-align-start">
          <ShieldCheck size={20} className="x-text-brand" />
          <div>
            <h2 className="x-h3">Your data stays private</h2>
            <p className="x-help">
              Your money data is stored in a secure database and only you can see it after signing in. Payments in Xpense are
              practice only — no real money moves.
            </p>
          </div>
        </div>
      </section>

      <div>
        <button type="button" className="x-btn x-btn-secondary" onClick={onSignOut}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
