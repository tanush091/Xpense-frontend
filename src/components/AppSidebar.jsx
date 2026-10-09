import React from 'react';
import { House, Wallet, ArrowLeftRight, PiggyBank, BarChart3, QrCode, Settings, LogOut, ChevronDown } from 'lucide-react';
import { getPersonaConfig } from '../data/personas';

export const NAV_ICONS = {
  dashboard: House,
  wallets: Wallet,
  transactions: ArrowLeftRight,
  goals: PiggyBank,
  analytics: BarChart3,
  payments: QrCode,
  settings: Settings
};

export const MAIN_NAV = ['dashboard', 'wallets', 'transactions', 'goals', 'analytics', 'payments'];

export function initialsOf(user) {
  const name = (user?.full_name || user?.name || user?.email || 'X').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || 'X') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function AppSidebar({ activeTab, onTabChange, user, counts = {}, onLogout, onOpenAccountSwapper }) {
  const persona = getPersonaConfig(user?.account_type);
  const labels = persona.labels;
  const subline = [persona.accountLabel, user?.university].filter(Boolean).join(' · ');

  const renderItem = (id) => {
    const Icon = NAV_ICONS[id];
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        className={`x-nav-item ${active ? 'is-active' : ''}`}
        onClick={() => onTabChange(id)}
        aria-current={active ? 'page' : undefined}
        title={labels[id]}
      >
        <Icon size={19} strokeWidth={active ? 2 : 1.6} />
        <span className="x-nav-label">{labels[id]}</span>
        {counts[id] > 0 && <span className="x-nav-count">{counts[id]}</span>}
      </button>
    );
  };

  return (
    <aside className="x-sidebar" aria-label="Main navigation">
      <div className="x-sidebar-top">
        <div className="x-brand">
          <span className="x-brand-mark">X</span>
          <span className="x-brand-name">Xpense</span>
        </div>

        <button type="button" className="x-account" onClick={onOpenAccountSwapper} title="Switch account">
          <span className="x-avatar">{initialsOf(user)}</span>
          <span className="x-account-text">
            <span className="x-account-name">{user?.full_name || user?.email}</span>
            <span className="x-account-sub">{subline}</span>
          </span>
          <ChevronDown size={15} className="x-account-chevron" />
        </button>

        <nav className="x-nav">{MAIN_NAV.map(renderItem)}</nav>
      </div>

      <div className="x-sidebar-bottom">
        <nav className="x-nav">{renderItem('settings')}</nav>
        <button type="button" className="x-nav-item" onClick={onLogout} title="Sign out">
          <LogOut size={19} strokeWidth={1.6} />
          <span className="x-nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
