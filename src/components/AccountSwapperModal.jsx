import React, { useState } from 'react';
import { 
  X, 
  User, 
  Check, 
  Plus, 
  Trash2, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  UserCheck, 
  ArrowRightLeft, 
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { getPersonaConfig } from '../data/personas';

export default function AccountSwapperModal({
  isOpen,
  onClose,
  currentUser,
  savedAccounts = [],
  onSwitchAccount,
  onRemoveAccount,
  onAddNewAccount
}) {
  const [mode, setMode] = useState('list'); // 'list' or 'add'
  const [newMode, setNewMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('Student Account');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentEmail = currentUser?.email || '';
  const currentPersona = getPersonaConfig(currentUser?.account_type || currentUser?.accountType);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onAddNewAccount({
        mode: newMode,
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        accountType
      });
      setEmail('');
      setPassword('');
      setFullName('');
      setMode('list');
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitch = async (targetEmail) => {
    if (targetEmail.toLowerCase() === currentEmail.toLowerCase()) return;
    try {
      await onSwitchAccount(targetEmail);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to switch profile');
    }
  };

  const otherAccounts = savedAccounts.filter(
    acc => acc.email.toLowerCase() !== currentEmail.toLowerCase()
  );

  return (
    <div className="modal-backdrop-saas" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-window-saas" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '540px', width: '100%', position: 'relative' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'rgba(250, 204, 21, 0.12)', 
                color: 'var(--accent-yellow)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                Profile & Account Swapper
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Switch between independent profile workflows
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice on Profile Workflow Isolation */}
        <div 
          style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: '10px', 
            padding: '12px 14px', 
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <Lock size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
            <strong>Isolated Profile Ledgers:</strong> Account types cannot be changed once established because each workflow uses distinct saving methodologies, technical terms, and budget algorithms. Use this swapper to transition cleanly between accounts.
          </div>
        </div>

        {mode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Active Account Card */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Currently Active Profile
              </div>
              <div 
                style={{ 
                  background: 'var(--bg-app)', 
                  border: `1.5px solid ${currentPersona.badgeColor}`, 
                  borderRadius: '12px', 
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '10px', 
                      background: `${currentPersona.badgeColor}22`, 
                      border: `1.5px solid ${currentPersona.badgeColor}`,
                      color: currentPersona.badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '16px'
                    }}
                  >
                    {(currentUser?.full_name || currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                        {currentUser?.full_name || currentUser?.name || 'Account Holder'}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          background: `${currentPersona.badgeColor}22`, 
                          color: currentPersona.badgeColor, 
                          padding: '2px 7px', 
                          borderRadius: '6px',
                          fontWeight: 800 
                        }}
                      >
                        {currentUser?.account_type || currentUser?.accountType || 'Student Account'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {currentUser?.email}
                      {currentUser?.university ? ` • ${currentUser.university}` : ''}
                    </div>
                  </div>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    color: '#10b981', 
                    fontSize: '11.5px', 
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '4px 9px',
                    borderRadius: '20px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Active
                </div>
              </div>
            </div>

            {/* Other Saved Profiles */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Other Registered Profiles ({otherAccounts.length})
              </div>

              {otherAccounts.length === 0 ? (
                <div 
                  style={{ 
                    background: 'var(--bg-app)', 
                    border: '1px dashed var(--border-subtle)', 
                    borderRadius: '10px', 
                    padding: '20px', 
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12.5px'
                  }}
                >
                  No other profiles saved on this browser yet. Click below to add or sign into another account profile.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {otherAccounts.map(acc => {
                    const accPersona = getPersonaConfig(acc.accountType);
                    return (
                      <div 
                        key={acc.email}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <div 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '8px', 
                              background: `${accPersona.badgeColor}22`, 
                              color: accPersona.badgeColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '14px',
                              flexShrink: 0
                            }}
                          >
                            {(acc.fullName || acc.email).charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {acc.fullName}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {acc.email} • <span style={{ color: accPersona.badgeColor }}>{acc.accountType}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button 
                            className="btn-secondary-action" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleSwitch(acc.email)}
                          >
                            Switch
                          </button>
                          <button 
                            onClick={() => onRemoveAccount(acc.email)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                            title="Remove saved account from list"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn-primary-action" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setMode('add'); setError(''); }}
              >
                <Plus size={16} />
                <span>+ Add / Switch to Another Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Add / Register New Account Mode */
          <div>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '4px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setNewMode('login'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: newMode === 'login' ? 'var(--accent-yellow)' : 'transparent',
                  color: newMode === 'login' ? '#000' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Sign In to Existing Profile
              </button>
              <button
                type="button"
                onClick={() => { setNewMode('signup'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: newMode === 'signup' ? 'var(--accent-yellow)' : 'transparent',
                  color: newMode === 'signup' ? '#000' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Register New Profile
              </button>
            </div>

            {error && (
              <div 
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fca5a5',
                  fontSize: '12.5px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              {newMode === 'signup' && (
                <>
                  <div className="form-group-saas">
                    <label className="form-label-saas">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input-saas" 
                      placeholder="e.g. Student Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group-saas">
                    <label className="form-label-saas">Account Classification (Immutable)</label>
                    <select 
                      className="form-input-saas"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                    >
                      <option value="Student Account">Student Account (Campus Budgeting)</option>
                      <option value="Personal Ledger">Personal Ledger</option>
                      <option value="Corporate SaaS">Corporate SaaS</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group-saas">
                <label className="form-label-saas">Email Address</label>
                <input 
                  type="email" 
                  className="form-input-saas" 
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group-saas">
                <label className="form-label-saas">Password</label>
                <input 
                  type="password" 
                  className="form-input-saas" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button 
                  type="button" 
                  className="btn-secondary-action" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setMode('list')}
                >
                  Back to List
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-action" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={15} className="spin-animate" /> Processing...
                    </span>
                  ) : (
                    newMode === 'login' ? 'Sign In & Switch' : 'Register & Switch'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
