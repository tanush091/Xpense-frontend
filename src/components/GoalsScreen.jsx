import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Plane, 
  Smartphone, 
  GraduationCap, 
  ShieldAlert, 
  X, 
  Trash2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GOAL_IDEAS } from '../data/demo';

export default function GoalsScreen({
  goals = [],
  onCreateGoal,
  onContributeGoal,
  onDeleteGoal
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [depositTarget, setDepositTarget] = useState(null);

  // Form states
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('5000');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [depositAmount, setDepositAmount] = useState('500');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    onCreateGoal({
      title: goalTitle,
      target_amount: parseFloat(targetAmount) || 5000,
      current_amount: 0,
      target_date: targetDate,
      category: 'Savings',
      status: 'in_progress'
    });

    setShowCreateModal(false);
    setGoalTitle('');
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositTarget || !depositAmount) return;

    onContributeGoal(depositTarget.id, parseFloat(depositAmount));
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {}

    setDepositTarget(null);
    setDepositAmount('500');
  };

  const handlePickIdea = (idea) => {
    setGoalTitle(idea.title);
    setTargetAmount(idea.amount.toString());
    setShowCreateModal(true);
  };

  return (
    <div className="goals-screen-container">
      {/* Header */}
      <div className="header-row">
        <div>
          <h1 className="header-greeting-title" style={{ fontSize: '24px' }}>Savings Goals</h1>
          <p className="header-subtext">Track your progress towards financial milestones</p>
        </div>
        <div 
          style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '14px', 
            background: '#8b5cf6', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}
        >
          <Target size={24} />
        </div>
      </div>

      {/* If No Active Goals */}
      {goals.length === 0 ? (
        <div className="empty-goals-box">
          <div className="empty-target-circle">
            <Target size={34} strokeWidth={2.2} />
          </div>
          <h3>No active saving goals yet</h3>
          <p>Set your first savings goal and start building towards your financial future</p>
          <button 
            className="purple-action-btn"
            onClick={() => setShowCreateModal(true)}
            id="btn-create-first-goal"
          >
            <Plus size={18} />
            <span>Create Goal</span>
          </button>
        </div>
      ) : (
        /* Active Goals List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Active Goals ({goals.length})
            </span>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#8b5cf6',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} /> New Goal
            </button>
          </div>

          {goals.map((goal) => {
            const current = parseFloat(goal.current_amount || 0);
            const target = parseFloat(goal.target_amount || 1);
            const percent = Math.min(100, Math.round((current / target) * 100));
            const isDone = percent >= 100;

            return (
              <div key={goal.id} className="active-goal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {goal.title}
                      {isDone && <CheckCircle2 size={16} color="#10b981" />}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} /> Target: {goal.target_date || 'No date set'}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete goal "${goal.title}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress bar & details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#a855f7' }}>
                    ₹{current.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    of ₹{target.toLocaleString('en-IN')} ({percent}%)
                  </span>
                </div>

                <div className="wallet-progress-bar-bg" style={{ background: '#1e2433', marginBottom: '16px' }}>
                  <div 
                    className="wallet-progress-bar-fill"
                    style={{ 
                      width: `${percent}%`, 
                      background: isDone ? '#10b981' : 'linear-gradient(90deg, #8b5cf6, #d946ef)' 
                    }}
                  />
                </div>

                <button 
                  onClick={() => setDepositTarget(goal)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    background: '#241a38',
                    border: '1px solid #4c1d95',
                    color: '#c084fc',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} /> Add Funds
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Ideas Box */}
      <div className="goal-ideas-card">
        <div className="goal-ideas-header">
          <span>💡</span>
          <span>Goal Ideas</span>
        </div>

        {GOAL_IDEAS.map((idea) => (
          <div 
            key={idea.id} 
            className="goal-idea-item"
            onClick={() => handlePickIdea(idea)}
            title="Click to adopt this goal"
          >
            <span>{idea.emoji}</span>
            <span>{idea.label}</span>
          </div>
        ))}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Create Savings Goal</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. New Laptop"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#8b5cf6', color: '#fff' }}>
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositTarget && (
        <div className="modal-overlay" onClick={() => setDepositTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Add Funds to Goal</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>{depositTarget.title}</p>
              </div>
              <button onClick={() => setDepositTarget(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="50"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['200', '500', '1000', '2000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      background: depositAmount === amt ? '#8b5cf6' : '#1e2433',
                      color: '#fff',
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
                <button type="button" className="btn-secondary" onClick={() => setDepositTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#8b5cf6', color: '#fff' }}>
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
