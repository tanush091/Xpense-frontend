export const PERSONA_CONFIGS = {
  'Student Account': {
    id: 'student',
    name: 'Student Account',
    badge: 'CAMPUS TIER',
    badgeColor: '#10b981',
    accountLabel: 'Student account',
    // Plain-language navigation and copy (no finance jargon)
    labels: {
      dashboard: 'Home',
      wallets: 'Budgets',
      transactions: 'Activity',
      goals: 'Savings',
      analytics: 'Insights',
      payments: 'Pay & receive',
      settings: 'Settings'
    },
    copy: {
      moneyInLabel: 'Pocket money',
      moneyInExamples: ['Pocket money from home', 'Scholarship or stipend', 'Part-time job', 'Gift'],
      homeSubtitle: "Here's where your money stands this month."
    },
    description: 'Campus budgeting, daily safe-to-spend allowance, mess/canteen envelopes, and academic savings.',
    primaryMetricTitle: 'Daily Safe-Spend Allowance',
    secondaryMetricTitle: 'Food & Canteen Cap',
    categories: [
      'Food & Dining',
      'Transportation',
      'Entertainment',
      'Education',
      'Hostel & Utilities',
      'Personal'
    ],
    defaultWallets: [
      { name: 'Food & Canteen', category: 'Food & Dining', budget_limit: 2500, icon: 'ShoppingBag', color: '#10B981' },
      { name: 'Campus Transit', category: 'Transportation', budget_limit: 800, icon: 'Car', color: '#3B82F6' },
      { name: 'Entertainment & Hangouts', category: 'Entertainment', budget_limit: 1000, icon: 'Gamepad2', color: '#A855F7' },
      { name: 'Books & Supplies', category: 'Education', budget_limit: 1500, icon: 'BookOpen', color: '#F59E0B' }
    ],
    goalIdeas: [
      { title: 'Semester Break Trip', target: 8000, category: 'Travel', icon: 'Plane', note: 'Group vacation with hostel friends' },
      { title: 'Certification Exam Fee', target: 3500, category: 'Education', icon: 'BookOpen', note: 'AWS / Cloud / Coding certification' },
      { title: 'New Laptop / Tablet', target: 45000, category: 'Tech', icon: 'Target', note: 'Academic hardware upgrade' }
    ]
  },

  'Corporate SaaS': {
    id: 'corporate',
    name: 'Corporate SaaS',
    badge: 'ENTERPRISE SAAS',
    badgeColor: '#8b5cf6',
    accountLabel: 'Business account',
    labels: {
      dashboard: 'Overview',
      wallets: 'Budgets',
      transactions: 'Transactions',
      goals: 'Reserves',
      analytics: 'Reports',
      payments: 'Payments',
      settings: 'Settings'
    },
    copy: {
      moneyInLabel: 'Revenue',
      moneyInExamples: ['Client payment', 'Retainer', 'Refund', 'Other income'],
      homeSubtitle: "Here's how the business is doing this month."
    },
    description: 'Multi-envelope business treasury, cloud hosting limits, vendor audit trails, and tax reserves.',
    primaryMetricTitle: 'Estimated Treasury Runway',
    secondaryMetricTitle: 'Monthly OpEx Burn Rate',
    categories: [
      'Cloud & Hosting',
      'Software Licenses',
      'Business Travel',
      'Corporate Tax',
      'Contractors & Payroll',
      'Marketing & Ads'
    ],
    defaultWallets: [
      { name: 'Cloud Infrastructure', category: 'Cloud & Hosting', budget_limit: 15000, icon: 'Server', color: '#3B82F6' },
      { name: 'SaaS Tooling', category: 'Software Licenses', budget_limit: 8000, icon: 'Cpu', color: '#8B5CF6' },
      { name: 'Client Entertainment', category: 'Business Travel', budget_limit: 6000, icon: 'Coffee', color: '#F59E0B' },
      { name: 'Tax & Reserve Pool', category: 'Corporate Tax', budget_limit: 25000, icon: 'ShieldCheck', color: '#10B981' }
    ],
    goalIdeas: [
      { title: 'Quarterly Advance Tax Pool', target: 50000, category: 'Tax', icon: 'ShieldCheck', note: 'GST / TDS advance reserve' },
      { title: 'Dedicated Server Migration', target: 120000, category: 'Infrastructure', icon: 'Server', note: 'High-availability compute cluster' },
      { title: '6-Month Operating Runway', target: 350000, category: 'Treasury', icon: 'Target', note: 'Payroll and critical software buffer' }
    ]
  },

  'Personal Ledger': {
    id: 'personal',
    name: 'Personal Ledger',
    badge: 'PERSONAL WEALTH',
    badgeColor: '#f59e0b',
    accountLabel: 'Personal account',
    labels: {
      dashboard: 'Home',
      wallets: 'Budgets',
      transactions: 'Activity',
      goals: 'Savings',
      analytics: 'Insights',
      payments: 'Pay & receive',
      settings: 'Settings'
    },
    copy: {
      moneyInLabel: 'Salary',
      moneyInExamples: ['Salary', 'Freelance payment', 'Interest', 'Gift'],
      homeSubtitle: "Here's where your household money stands this month."
    },
    description: 'Household liquidity allocation, grocery caps, utility schedules, and emergency fund growth.',
    primaryMetricTitle: 'Net Monthly Savings Rate',
    secondaryMetricTitle: 'Household Fixed Overhead',
    categories: [
      'Groceries',
      'Housing & Bills',
      'Healthcare',
      'Shopping',
      'Investments',
      'Family Leisure'
    ],
    defaultWallets: [
      { name: 'Groceries & Home', category: 'Groceries', budget_limit: 12000, icon: 'ShoppingBag', color: '#10B981' },
      { name: 'Rent & Utilities', category: 'Housing & Bills', budget_limit: 20000, icon: 'Home', color: '#3B82F6' },
      { name: 'Health & Wellness', category: 'Healthcare', budget_limit: 5000, icon: 'HeartPulse', color: '#EC4899' },
      { name: 'Lifestyle & Retail', category: 'Shopping', budget_limit: 8000, icon: 'ShoppingCart', color: '#F59E0B' }
    ],
    goalIdeas: [
      { title: 'Emergency Liquid Reserve (6M)', target: 180000, category: 'Savings', icon: 'Target', note: 'FD / Liquid mutual fund pool' },
      { title: 'Annual Family Vacation', target: 75000, category: 'Travel', icon: 'Plane', note: 'Flights and hotel bookings' },
      { title: 'Home Renovation / Appliance', target: 50000, category: 'Home', icon: 'Home', note: 'Living room upgrades and electronics' }
    ]
  }
};

export function getPersonaConfig(accountType) {
  if (!accountType) return PERSONA_CONFIGS['Student Account'];
  const normalized = accountType.toLowerCase();
  if (normalized.includes('corporate') || normalized.includes('saas') || normalized.includes('enterprise')) {
    return PERSONA_CONFIGS['Corporate SaaS'];
  }
  if (normalized.includes('personal') || normalized.includes('ledger') || normalized.includes('wealth')) {
    return PERSONA_CONFIGS['Personal Ledger'];
  }
  return PERSONA_CONFIGS['Student Account'];
}
