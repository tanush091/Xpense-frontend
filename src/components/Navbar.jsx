import React from 'react';
import { Home, Wallet, Target, BarChart3, User } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="app-bottom-navbar" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-btn-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
