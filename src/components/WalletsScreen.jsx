import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Car, 
  Gamepad2, 
  ShoppingBag, 
  ShoppingCart, 
  Wallet,
  X,
  Check
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': ShoppingBag,
  'Transportation': Car,
  'Entertainment': Gamepad2,
  'Shopping': ShoppingCart,
  'Shopping & Utilities': ShoppingCart,
  'General': Wallet
};

export default function WalletsScreen({
  wallets = [],
  onAddWallet,
  onTopUpWallet,
  onDeleteWallet
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [topUpTarget, setTopUpTarget] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Form states for Add Wallet
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletCategory, setNewWalletCategory] = useState('Food & Dining');
  const [newWalletLimit, setNewWalletLimit] = useState('1000');
  const [newWalletBalance, setNewWalletBalance] = useState('500');

  // Top up amount
  const [topUpAmount, setTopUpAmount] = useState('500');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    let icon = 'Wallet';
    let color = '#3B82F6';
    if (newWalletCategory === 'Food & Dining') { icon = 'ShoppingBag'; color = '#10B981'; }
    else if (newWalletCategory === 'Transportation') { icon = 'Car'; color = '#3B82F6'; }
    else if (newWalletCategory === 'Entertainment') { icon = 'Gamepad2'; color = '#A855F7'; }
    else if (newWalletCategory === 'Shopping') { icon = 'ShoppingCart'; color = '#F59E0B'; }

    onAddWallet({
      name: newWalletName,
      category: newWalletCategory,
      budget_limit: parseFloat(newWalletLimit) || 1000,
      balance: parseFloat(newWalletBalance) || 0,
      icon,
      color
    });

    setShowAddModal(false);
    setNewWalletName('');
  };

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    if (!topUpTarget || !topUpAmount) return;
    onTopUpWallet(topUpTarget.id, parseFloat(topUpAmount));
    setTopUpTarget(null);
    setTopUpAmount('500');
  };

  return (
    <div className="wallets-screen-container">
      {/* Header */}
      <div className="header-row">
        <div>
          <h1 className="header-greeting-title" style={{ fontSize: '24px' }}>Your Wallets</h1>
          <p className="header-subtext">Organize your spending by category</p>
        </div>
        <div 
          style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '14px', 
            background: '#10b981', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Wallet size={24} />
        </div>
      </div>

      {/* Dashed Add Card */}
      <button 
        className="dashed-add-card" 
        onClick={() => setShowAddModal(true)}
        id="btn-add-wallet-dashed"
      >
        <div className="dashed-icon-btn">
          <Plus size={24} />
        </div>
        <div>
          <h4>Add New Wallet</h4>
          <p>Create a spending category</p>
        </div>
      </button>

      {/* Wallet List */}
      {wallets.map((wallet) => {
        const IconComponent = CATEGORY_ICONS[wallet.category] || Wallet;
        const progressPercent = Math.min(
          100, 
          Math.round((wallet.balance / (wallet.budget_limit || 1)) * 100)
        );
        const isMenuOpen = menuOpenId === wallet.id;

        return (
          <div key={wallet.id} className="wallet-card-item">
            {/* Header of Card */}
            <div className="wallet-card-header">
              <div 
                className="wallet-icon-container" 
                style={{ background: wallet.color || '#3b82f6' }}
              >
                <IconComponent size={24} />
              </div>
              <div className="wallet-title-area">
                <h3 style={{ color: wallet.color || '#0f172a' }}>{wallet.name}</h3>
                <span className="wallet-cycle-tag">{wallet.cycle_days_left || 30} days left in cycle</span>
              </div>
              <div style={{ position: 'relative' }}>
                <button 
                  className="wallet-dots-btn"
                  onClick={() => setMenuOpenId(isMenuOpen ? null : wallet.id)}
                  aria-label="Wallet menu"
                >
                  <MoreVertical size={20} />
                </button>

                {/* 3-dots Dropdown */}
                {isMenuOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '32px',
                      background: '#1f2430',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      border: '1px solid #333d52',
                      zIndex: 20,
                      minWidth: '150px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => {
                        setTopUpTarget(wallet);
                        setMenuOpenId(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'none',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Top Up Wallet
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${wallet.name}? This action cannot be undone.`)) {
                          onDeleteWallet(wallet.id);
                        }
                        setMenuOpenId(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderTop: '1px solid #2d3546'
                      }}
                    >
                      Delete Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Amount details */}
            <div className="wallet-amount-row">
              <span className="wallet-current-amt">₹{Number(wallet.balance).toLocaleString('en-IN')}</span>
              <span className="wallet-limit-amt">of ₹{Number(wallet.budget_limit).toLocaleString('en-IN')}</span>
            </div>

            {/* Progress Bar */}
            <div className="wallet-progress-bar-bg">
              <div 
                className="wallet-progress-bar-fill" 
                style={{ 
                  width: `${progressPercent}%`, 
                  background: wallet.color || '#3b82f6' 
                }}
              />
            </div>

            {/* Daily Avg & Status */}
            <div className="wallet-meta-row">
              <span>Daily avg: ₹{wallet.daily_avg || 350}</span>
              <span className={`wallet-badge ${wallet.status === 'Low' ? 'badge-low' : 'badge-good'}`}>
                {wallet.status || (wallet.balance < 200 ? 'Low' : 'Good')}
              </span>
            </div>

            {/* Top Up Button */}
            <button 
              className="wallet-topup-btn"
              onClick={() => setTopUpTarget(wallet)}
            >
              <Plus size={16} />
              <span>Top Up</span>
            </button>
          </div>
        );
      })}

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Add New Wallet</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Wallet Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Groceries & Snacks"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={newWalletCategory}
                  onChange={(e) => setNewWalletCategory(e.target.value)}
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping & Utilities</option>
                  <option value="General">General Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Budget Limit (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="2000"
                  value={newWalletLimit}
                  onChange={(e) => setNewWalletLimit(e.target.value)}
                  min="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Balance (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="500"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {topUpTarget && (
        <div className="modal-overlay" onClick={() => setTopUpTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Top Up Wallet</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>{topUpTarget.name}</p>
              </div>
              <button onClick={() => setTopUpTarget(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit}>
              <div className="form-group">
                <label className="form-label">Enter Top Up Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="10"
                  step="10"
                  required
                />
              </div>

              {/* Quick pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['100', '200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      background: topUpAmount === amt ? '#facc15' : '#1e2433',
                      color: topUpAmount === amt ? '#000' : '#cbd5e1',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="form-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setTopUpTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Top Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
