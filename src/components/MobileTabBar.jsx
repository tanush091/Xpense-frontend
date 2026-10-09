import React, { useState } from 'react';
import { MoreHorizontal, LogOut, Users } from 'lucide-react';
import { NAV_ICONS } from './AppSidebar';
import { getPersonaConfig } from '../data/personas';

const TABS = ['dashboard', 'wallets', 'transactions', 'goals'];
const MORE = ['analytics', 'payments', 'settings'];

/** Bottom tab bar for phones (< 768px), five items max (DESIGN §4). */
export default function MobileTabBar({ activeTab, onTabChange, user, onLogout, onOpenAccountSwapper }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const labels = getPersonaConfig(user?.account_type).labels;
  const moreActive = MORE.includes(activeTab);

  const go = (id) => {
    setMoreOpen(false);
    onTabChange(id);
  };

  return (
    <>
      {moreOpen && (
        <div className="x-scrim x-more-scrim" onClick={() => setMoreOpen(false)}>
          <div className="x-more-sheet" onClick={(e) => e.stopPropagation()} role="menu">
            {MORE.map((id) => {
              const Icon = NAV_ICONS[id];
              return (
                <button key={id} type="button" className="x-more-item" onClick={() => go(id)} role="menuitem">
                  <Icon size={19} strokeWidth={1.6} />
                  <span>{labels[id]}</span>
                </button>
              );
            })}
            <button
              type="button"
              className="x-more-item"
              onClick={() => {
                setMoreOpen(false);
                onOpenAccountSwapper();
              }}
            >
              <Users size={19} strokeWidth={1.6} />
              <span>Switch account</span>
            </button>
            <button type="button" className="x-more-item" onClick={onLogout}>
              <LogOut size={19} strokeWidth={1.6} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      <nav className="x-tabbar" aria-label="Main navigation">
        {TABS.map((id) => {
          const Icon = NAV_ICONS[id];
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`x-tab ${active ? 'is-active' : ''}`}
              onClick={() => go(id)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.6} />
              <span>{labels[id]}</span>
            </button>
          );
        })}
        <button type="button" className={`x-tab ${moreActive ? 'is-active' : ''}`} onClick={() => setMoreOpen(true)}>
          <MoreHorizontal size={20} strokeWidth={1.6} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
