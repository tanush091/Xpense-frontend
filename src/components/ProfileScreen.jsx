import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  X,
  Check,
  Lock
} from 'lucide-react';

export default function ProfileScreen({
  user,
  walletsCount = 0,
  goalsCount = 0,
  transactionsCount = 0,
  onUpdateProfile,
  onLogout
}) {
  const [activeModal, setActiveModal] = useState(null);

  // Edit settings form
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const accountType = user?.account_type || user?.accountType || 'Student Account';

  // Sync state whenever user prop updates
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.fullName || user.name || '');
      setEmail(user.email || '');
      setUniversity(user.university || '');
      setSemester(user.semester || '');
    }
  }, [user]);

  // Security toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);

  // Notification toggles
  const [spendingAlerts, setSpendingAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile({ 
      full_name: fullName, 
      fullName, 
      email, 
      university, 
      semester 
    });
    setActiveModal(null);
  };

  const displayName = user?.full_name || user?.fullName || user?.name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="header-row">
        <div>
          <h1 className="header-greeting-title" style={{ fontSize: '24px' }}>Profile</h1>
          <p className="header-subtext">Manage your account and preferences</p>
        </div>
        <div 
          style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '50%', 
            background: '#1f2432', 
            color: '#94a3b8', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <User size={22} />
        </div>
      </div>

      {/* Profile Gradient Banner */}
      <div className="profile-banner-card">
        <div className="avatar-circle-lg">
          {initial}
        </div>
        <div className="profile-info-col">
          <h3>{displayName}</h3>
          <p>{user?.email || 'user@example.com'}</p>
          <div className="profile-badge-row">
            <span className="profile-badge">{user?.account_type || user?.accountType || 'Student Account'}</span>
            <span className="profile-badge">{user?.role || 'user'}</span>
          </div>
        </div>
      </div>

      {/* 3 Mini Stat Counters */}
      <div className="profile-stat-row">
        <div className="profile-stat-box">
          <div className="num">{walletsCount}</div>
          <div className="txt">Active Wallets</div>
        </div>
        <div className="profile-stat-box">
          <div className="num">{goalsCount}</div>
          <div className="txt">Savings Goals</div>
        </div>
        <div className="profile-stat-box">
          <div className="num">{transactionsCount}</div>
          <div className="txt">Transactions</div>
        </div>
      </div>

      {/* Menu List */}
      <div className="profile-menu-list">
        <button className="profile-menu-item" onClick={() => setActiveModal('account')}>
          <div className="profile-menu-icon">
            <Settings size={20} />
          </div>
          <div className="profile-menu-text">
            <h4>Account Settings</h4>
            <p>Personal info, preferences</p>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>

        <button className="profile-menu-item" onClick={() => setActiveModal('security')}>
          <div className="profile-menu-icon">
            <Shield size={20} />
          </div>
          <div className="profile-menu-text">
            <h4>Security & Privacy</h4>
            <p>PIN, biometrics, data</p>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>

        <button className="profile-menu-item" onClick={() => setActiveModal('notifications')}>
          <div className="profile-menu-icon">
            <Bell size={20} />
          </div>
          <div className="profile-menu-text">
            <h4>Notifications</h4>
            <p>Spending alerts, reminders</p>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>

        <button className="profile-menu-item" onClick={() => setActiveModal('payment_methods')}>
          <div className="profile-menu-icon">
            <CreditCard size={20} />
          </div>
          <div className="profile-menu-text">
            <h4>Payment Methods</h4>
            <p>Cards, bank accounts</p>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>

        <button className="profile-menu-item" onClick={() => setActiveModal('help')}>
          <div className="profile-menu-icon">
            <HelpCircle size={20} />
          </div>
          <div className="profile-menu-text">
            <h4>Help & Support</h4>
            <p>FAQs, contact support</p>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>
      </div>

      {/* Logout Button */}
      <button 
        className="logout-card-btn" 
        onClick={() => {
          if (window.confirm('Do you want to log out of Xpense?')) {
            onLogout();
          }
        }}
        id="btn-profile-logout"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>

      {/* Account Settings Modal */}
      {activeModal === 'account' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Account Settings</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">University / College</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. SASTRA Deemed University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Semester / Term</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Semester 4"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Account Tier</label>
                  <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <Lock size={12} /> Permanent
                  </span>
                </div>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)', 
                    borderRadius: '10px', 
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <span>{accountType} (Campus Mode)</span>
                  <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>
                    LOCKED
                  </span>
                </div>
              </div>
              <div className="form-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Security & Privacy</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Quick PIN Lock</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Require 4-digit PIN for transfers</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={pinEnabled} 
                  onChange={(e) => setPinEnabled(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#facc15' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Biometric Login</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Face ID / Fingerprint prompt</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricsEnabled} 
                  onChange={(e) => setBiometricsEnabled(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#facc15' }}
                />
              </div>
            </div>
            <div className="form-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Notifications</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Budget Warnings</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alert when spending reaches 80%</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={spendingAlerts} 
                  onChange={(e) => setSpendingAlerts(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#facc15' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Daily Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Evening rundown of spendings</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={dailyDigest} 
                  onChange={(e) => setDailyDigest(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#facc15' }}
                />
              </div>
            </div>
            <div className="form-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Modal */}
      {activeModal === 'payment_methods' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Linked Payment Methods</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#1c2230', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>UPI Virtual ID</div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>{user?.email || 'user@xpense.com'} • Active</div>
                </div>
                <Check size={18} color="#10b981" />
              </div>
              <div style={{ background: '#1c2230', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Campus Transit Card</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>•••• 9012</div>
                </div>
                <CreditCard size={18} color="#94a3b8" />
              </div>
            </div>
            <div className="form-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Help & Support</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong style={{ color: '#fff' }}>How do Wallets work?</strong>
                <p style={{ marginTop: '2px' }}>Wallets act as category envelopes. When you scan to pay or spend, funds deduct from that specific envelope.</p>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Can I connect real Supabase?</strong>
                <p style={{ marginTop: '2px' }}>Yes! Add your Supabase URL and anon key into `.env` and execute `supabase/schema.sql`.</p>
              </div>
            </div>
            <div className="form-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
