import React from 'react';
import { Plus, ArrowDownLeft } from 'lucide-react';

/** Global actions only: the two things a student does most — add an expense, add money in. */
export default function AppTopbar({ onAddExpense, onAddMoneyIn, moneyInLabel = 'money' }) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <header className="x-topbar">
      <div className="x-topbar-left">
        <span className="x-brand-mark x-topbar-mark">X</span>
        <span className="x-topbar-date">{today}</span>
      </div>
      <div className="x-topbar-actions">
        <button type="button" className="x-btn x-btn-secondary" onClick={onAddMoneyIn} title={`Add ${moneyInLabel.toLowerCase()}`}>
          <ArrowDownLeft size={16} />
          <span className="x-hide-sm">Add money in</span>
          <span className="x-show-sm">Money in</span>
        </button>
        <button type="button" className="x-btn x-btn-primary" onClick={onAddExpense}>
          <Plus size={16} />
          <span>Add expense</span>
        </button>
      </div>
    </header>
  );
}
