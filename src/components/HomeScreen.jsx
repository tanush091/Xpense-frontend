import React, { useState } from 'react';
import { 
  QrCode, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart2, 
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Car,
  Gamepad2,
  BookOpen
} from 'lucide-react';

export default function HomeScreen({
  user,
  wallets = [],
  goals = [],
  transactions = [],
  analytics,
  onNavigate
}) {
  const [showBalance, setShowBalance] = useState(true);

  // Total balance calculated from user profile or sum of envelopes
  const totalBal = user?.total_balance !== undefined
    ? Number(user.total_balance)
    : wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
  const formattedBalance = totalBal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const monthlySpend = analytics?.monthlyTrends?.thisMonth !== undefined
    ? Number(analytics.monthlyTrends.thisMonth).toLocaleString('en-IN')
    : '0';

  const avgDaily = analytics?.dailyPatterns?.avgDailySpend !== undefined
    ? Number(analytics.dailyPatterns.avgDailySpend).toLocaleString('en-IN')
    : '0';

  // Calculate today's spending from actual transactions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySpendNum = transactions
    .filter(t => t.type === 'expense' && new Date(t.timestamp || t.date || Date.now()) >= todayStart)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const activeGoalsCount = goals.filter(g => g.status === 'in_progress').length;

  // Real envelope alert
  const lowWallet = wallets.find(w => {
    const lim = parseFloat(w.budget_limit || 0);
    return lim > 0 && (parseFloat(w.balance || 0) / lim) < 0.25;
  });

  return (
    <div className="home-screen-layout">
      {/* Top Header */}
      <div className="header-row">
        <div>
          <h1 className="header-greeting-title">
            Hey there! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="header-subtext">Ready to spend smart?</p>
        </div>
        <button 
          className="brand-badge-btn" 
          onClick={() => onNavigate('profile')}
          title="Account profile"
          id="home-brand-logo-btn"
        >
          X
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-grid">
        {/* Left: Scan & Pay Big Yellow Card */}
        <button 
          className="quick-action-main" 
          onClick={() => onNavigate('scan-pay')}
          id="btn-quick-scan-pay"
        >
          <div className="qr-icon-container">
            <QrCode size={32} strokeWidth={2.2} />
          </div>
          <div>
            <h3>Scan & Pay</h3>
            <p>Instant payments</p>
          </div>
        </button>

        {/* Right: Send & Receive Stacked Cards */}
        <div className="quick-actions-stacked">
          <button 
            className="stacked-action-btn"
            onClick={() => onNavigate('send-money')}
            id="btn-quick-send-money"
          >
            <div className="stacked-action-icon" style={{ background: '#2e2413', color: '#f59e0b' }}>
              <ArrowUpRight size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h4>Send</h4>
              <p>Transfer money</p>
            </div>
          </button>

          <button 
            className="stacked-action-btn"
            onClick={() => onNavigate('receive-money')}
            id="btn-quick-receive-money"
          >
            <div className="stacked-action-icon" style={{ background: '#11291f', color: '#10b981' }}>
              <ArrowDownLeft size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h4>Receive</h4>
              <p>Request funds</p>
            </div>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="balance-card">
        <div className="balance-header">
          <span>Total Balance</span>
          <button 
            className="eye-toggle-btn"
            onClick={() => setShowBalance(!showBalance)}
            title={showBalance ? "Hide balance" : "Show balance"}
            id="btn-toggle-balance-visibility"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="balance-amount">
          {showBalance ? `₹${formattedBalance}` : '••••••••'}
        </div>

        <div className="balance-tagline">
          <span>💰</span>
          <span>Ready to spend smart</span>
        </div>

        <div className="balance-status-row">
          <div className="status-dot-item">
            <span className="dot-yellow"></span>
            <span>All wallets active</span>
          </div>
          <div className="status-dot-item">
            <span className="dot-green"></span>
            <span>Goals on track</span>
          </div>
        </div>
      </div>

      {/* 2x2 Metric Grid */}
      <div className="metric-grid-2x2">
        <div className="metric-stat-card" onClick={() => onNavigate('analytics')} style={{ cursor: 'pointer' }}>
          <div className="metric-top-row">
            <div className="metric-value">₹{monthlySpend}</div>
            <div className="metric-icon-box" style={{ background: '#2e2613', color: '#facc15' }}>
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="metric-label">Monthly Spend</div>
            <div className="metric-subtext">This month</div>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-top-row">
            <div className="metric-value">₹{todaySpendNum.toLocaleString('en-IN')}</div>
            <div className="metric-icon-box" style={{ background: '#132820', color: '#10b981' }}>
              <Calendar size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="metric-label">Today's Spending</div>
            <div className="metric-subtext">Today</div>
          </div>
        </div>

        <div className="metric-stat-card" onClick={() => onNavigate('goals')} style={{ cursor: 'pointer' }}>
          <div className="metric-top-row">
            <div className="metric-value">{activeGoalsCount}</div>
            <div className="metric-icon-box" style={{ background: '#162338', color: '#38bdf8' }}>
              <Target size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="metric-label">Active Goals</div>
            <div className="metric-subtext">In progress</div>
          </div>
        </div>

        <div className="metric-stat-card" onClick={() => onNavigate('analytics')} style={{ cursor: 'pointer' }}>
          <div className="metric-top-row">
            <div className="metric-value">₹{avgDaily}</div>
            <div className="metric-icon-box" style={{ background: '#251b36', color: '#c084fc' }}>
              <BarChart2 size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="metric-label">Avg Daily Spend</div>
            <div className="metric-subtext">Last 7 days</div>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="ai-insights-container">
        <div className="ai-header-row">
          <div className="ai-sparkle-badge">
            <Sparkles size={24} />
          </div>
          <div className="ai-header-info">
            <h3>AI Velocity Copilot</h3>
            <p>Real-time ledger analytics</p>
          </div>
        </div>

        {lowWallet ? (
          <div className="ai-tip-card amber">
            <div style={{ color: '#facc15', marginTop: '2px' }}>
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="ai-tip-title">Envelope Alert: {lowWallet.name}</div>
              <div className="ai-tip-desc">
                Only ₹{parseFloat(lowWallet.balance).toLocaleString('en-IN')} remaining of ₹{parseFloat(lowWallet.budget_limit).toLocaleString('en-IN')} budget cap.
              </div>
            </div>
          </div>
        ) : (
          <div className="ai-tip-card green">
            <div style={{ color: '#34d399', marginTop: '2px' }}>
              💡
            </div>
            <div>
              <div className="ai-tip-title">Liquidity Health: Optimal</div>
              <div className="ai-tip-desc">
                All spending envelopes are operating within safe budgetary limits.
              </div>
            </div>
          </div>
        )}

        <div className="ai-tip-card green">
          <div style={{ color: '#38bdf8', marginTop: '2px' }}>
            🎯
          </div>
          <div>
            <div className="ai-tip-title">Savings Target Tracker</div>
            <div className="ai-tip-desc">
              {activeGoalsCount > 0 
                ? `You have ${activeGoalsCount} active milestone${activeGoalsCount > 1 ? 's' : ''} accumulating funds.`
                : 'No active savings goals yet. Create a milestone to start locking liquidity.'}
            </div>
          </div>
        </div>

        <div className="ai-footer-note">
          ✨ More insights coming as you spend
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Recent Activity</h3>
          <button 
            onClick={() => onNavigate('analytics')} 
            style={{ background: 'none', border: 'none', color: '#facc15', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.slice(0, 4).map((tx) => (
            <div 
              key={tx.id} 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: tx.type === 'income' ? '#064e3b' : '#1f2430',
                  color: tx.type === 'income' ? '#10b981' : '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {tx.category === 'Food & Dining' ? <ShoppingBag size={20} /> :
                   tx.category === 'Transportation' ? <Car size={20} /> :
                   tx.category === 'Entertainment' ? <Gamepad2 size={20} /> :
                   <BookOpen size={20} />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{tx.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tx.date} • {tx.wallet_name || 'Wallet'}</div>
                </div>
              </div>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 800, 
                color: tx.type === 'income' ? '#10b981' : '#fff' 
              }}>
                {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
