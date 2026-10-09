import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsScreen({
  analytics,
  transactions = [],
  wallets = []
}) {
  const breakdown = analytics?.breakdown || [];

  const monthlyTrends = analytics?.monthlyTrends || {
    thisMonth: 0,
    lastMonth: 0,
    change: '0%'
  };

  const dailyPatterns = analytics?.dailyPatterns || {
    peakDay: 'N/A',
    avgDailySpend: 0,
    bestDay: 'N/A'
  };

  const isPositiveChange = String(monthlyTrends.change).startsWith('+');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="header-row">
        <div>
          <h1 className="header-greeting-title" style={{ fontSize: '24px' }}>Analytics</h1>
          <p className="header-subtext">Insights & spending patterns</p>
        </div>
        <div 
          style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '14px', 
            background: '#0ea5e9', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
          }}
        >
          <BarChart3 size={24} />
        </div>
      </div>

      {/* Top Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #132738 0%, #161e2e 100%)',
          border: '1px solid #1e3a5f',
          borderRadius: '20px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Personalized Financial AI</div>
          <div style={{ fontSize: '12.5px', color: '#93c5fd' }}>Data synced in real time across wallets</div>
        </div>
      </div>

      {/* Card 1: Spending Breakdown */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px', 
          padding: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ color: '#10b981' }}>
            <PieChart size={20} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Spending Breakdown</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {breakdown.length === 0 ? (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>No expense transactions recorded yet.</p>
              <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Your category expenditure breakdown will populate here.
              </p>
            </div>
          ) : (
            breakdown.map((item, idx) => {
              const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
              const barColor = colors[idx % colors.length];

              return (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#cbd5e1' }}>{item.category}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                      ₹{Number(item.amount).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({item.percentage}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#1e2433', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: barColor, borderRadius: '99px' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Card 2: Monthly Trends */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px', 
          padding: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ color: '#0ea5e9' }}>
            <TrendingUp size={20} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Monthly Trends</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>This Month</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>₹{Number(monthlyTrends.thisMonth).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Last Month</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>₹{Number(monthlyTrends.lastMonth).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Change</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              color: isPositiveChange ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isPositiveChange ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {monthlyTrends.change}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Daily Patterns */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px', 
          padding: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ color: '#10b981' }}>
            <Calendar size={20} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Daily Patterns</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Peak Spending Day</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{dailyPatterns.peakDay}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Avg Daily Spend</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#facc15' }}>₹{dailyPatterns.avgDailySpend}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Best Saving Day</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{dailyPatterns.bestDay}</span>
          </div>
        </div>
      </div>

      {/* Card 4: Smart Insights */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px', 
          padding: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
            AI
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Smart Insights</h3>
        </div>

        <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5', fontStyle: 'italic' }}>
          "AI will analyze your patterns and suggest budget optimizations, spending alerts, and savings opportunities"
        </p>

        {analytics?.insights && analytics.insights.length > 0 && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.insights.map((ins, i) => (
              <div key={i} style={{ background: '#1c2230', padding: '12px 14px', borderRadius: '12px', borderLeft: `3px solid ${ins.type === 'warning' ? '#f59e0b' : '#10b981'}` }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{ins.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{ins.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
