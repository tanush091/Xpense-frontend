export const PERSONA_CONFIGS = {
  'Student Account': {
    id: 'student',
    name: 'Student Account',
    badge: 'CAMPUS TIER',
    badgeColor: '#10b981',
    accountLabel: 'Student account',
    // Plain-language navigation and copy (no finance jargon)
    extraNav: [],
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
      homeSubtitle: "Here's where your money stands this month.",
      budgetsSubtitle: "Split your money into budgets so you always know what's left for food, travel, books and fun.",
      goalsTitle: 'Savings',
      goalsSubtitle: 'Set money aside for things that matter, like a trip, a laptop or an emergency.',
      expenseQuick: [50, 100, 200, 500],
      incomeQuick: [1000, 2000, 5000, 10000],
      budgetIdeas: [
        { name: 'Hostel & Laundry', category: 'Hostel & Utilities', budget_limit: 1500 },
        { name: 'Phone & Data', category: 'Personal', budget_limit: 300 },
        { name: 'Weekend Outings', category: 'Entertainment', budget_limit: 800 },
        { name: 'Exam & Course Fees', category: 'Education', budget_limit: 2000 }
      ],
      shops: [
        { id: 'campus-cafe', name: 'Campus Cafeteria', location: 'Main block' },
        { id: 'coffee', name: 'The Coffee House', location: 'Near campus' },
        { id: 'bookstore', name: 'University Bookstore', location: 'Academic wing' },
        { id: 'metro', name: 'Metro Card Recharge', location: 'Station gate 2' }
      ]
    },
    description: 'Make pocket money last the month: daily spending amount, food and travel budgets, and savings goals.',
    primaryMetricTitle: 'You can spend today',
    secondaryMetricTitle: 'Food budget',
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
      { name: 'Books & Academic Supplies', category: 'Education', budget_limit: 1500, icon: 'BookOpen', color: '#F59E0B' }
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
    extraNav: ['payees'],
    labels: {
      dashboard: 'Overview',
      wallets: 'Budgets',
      transactions: 'Transactions',
      goals: 'Reserves',
      analytics: 'Reports',
      payments: 'Payments',
      settings: 'Settings',
      payees: 'Payees'
    },
    copy: {
      moneyInLabel: 'Revenue',
      moneyInExamples: ['Client payment', 'Retainer', 'Refund', 'Other income'],
      homeSubtitle: "Here's how the business is doing this month.",
      budgetsSubtitle: 'Give each area of the business its own budget, like cloud, software, travel and tax.',
      goalsTitle: 'Reserves',
      goalsSubtitle: 'Money kept aside for big costs and safety, like tax, a new server or 6 months of running costs.',
      expenseQuick: [500, 1000, 5000, 10000],
      incomeQuick: [10000, 25000, 50000, 100000],
      budgetIdeas: [
        { name: 'Marketing & Ads', category: 'Marketing & Ads', budget_limit: 10000 },
        { name: 'Contractors', category: 'Contractors & Payroll', budget_limit: 30000 },
        { name: 'Office & Internet', category: 'Software Licenses', budget_limit: 5000 },
        { name: 'Travel', category: 'Business Travel', budget_limit: 8000 }
      ],
      shops: [
        { id: 'aws', name: 'Amazon Web Services', location: 'Cloud hosting' },
        { id: 'gworkspace', name: 'Google Workspace', location: 'Email and documents' },
        { id: 'figma', name: 'Figma', location: 'Design software' },
        { id: 'cowork', name: 'WeWork Co-working', location: 'Office space' }
      ]
    },
    description: 'Track business cash: months of cash left, profit, money set aside for tax, and who you pay.',
    primaryMetricTitle: 'Months of cash left',
    secondaryMetricTitle: 'Monthly spending',
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
      { name: 'Software Licenses & Tooling', category: 'Software Licenses', budget_limit: 8000, icon: 'Cpu', color: '#8B5CF6' },
      { name: 'Client Meetings & Dinners', category: 'Business Travel', budget_limit: 6000, icon: 'Coffee', color: '#F59E0B' },
      { name: 'Tax & Contingency Reserve', category: 'Corporate Tax', budget_limit: 25000, icon: 'ShieldCheck', color: '#10B981' }
    ],
    goalIdeas: [
      { title: 'Quarterly Advance Tax Pool', target: 50000, category: 'Tax', icon: 'ShieldCheck', note: 'GST / TDS advance reserve' },
      { title: 'Dedicated Server Migration', target: 120000, category: 'Infrastructure', icon: 'Server', note: 'High-availability compute cluster' },
      { title: '6 months of running costs', target: 350000, category: 'Savings', icon: 'Target', note: 'Salaries and key software if money stops coming in' }
    ]
  },

  'Personal Ledger': {
    id: 'personal',
    name: 'Personal Ledger',
    badge: 'PERSONAL WEALTH',
    badgeColor: '#f59e0b',
    accountLabel: 'Personal account',
    extraNav: ['bills'],
    labels: {
      dashboard: 'Home',
      wallets: 'Budgets',
      transactions: 'Activity',
      goals: 'Savings',
      analytics: 'Insights',
      payments: 'Pay & receive',
      settings: 'Settings',
      bills: 'Bills'
    },
    copy: {
      moneyInLabel: 'Salary',
      moneyInExamples: ['Salary', 'Freelance payment', 'Interest', 'Gift'],
      homeSubtitle: "Here's where your household money stands this month.",
      budgetsSubtitle: "Split your salary into budgets so you know what's left for groceries, health and the rest of life.",
      goalsTitle: 'Savings',
      goalsSubtitle: 'Save for an emergency fund, a family trip or something for the home.',
      expenseQuick: [100, 500, 1000, 2000],
      incomeQuick: [10000, 25000, 50000, 75000],
      budgetIdeas: [
        { name: 'Fuel & Travel', category: 'Family Leisure', budget_limit: 4000 },
        { name: 'Kids & School', category: 'Shopping', budget_limit: 5000 },
        { name: 'Eating Out', category: 'Family Leisure', budget_limit: 3000 },
        { name: 'Investments (SIP)', category: 'Investments', budget_limit: 5000 }
      ],
      shops: [
        { id: 'grocery', name: 'Fresh Mart Groceries', location: 'Neighbourhood store' },
        { id: 'pharmacy', name: 'Apollo Pharmacy', location: 'Medicines' },
        { id: 'fuel', name: 'City Fuel Station', location: 'Petrol and diesel' },
        { id: 'electric', name: 'Electricity Board', location: 'Power bill' }
      ]
    },
    description: 'Run the household: money left after bills, bill reminders, budgets, and an emergency fund.',
    primaryMetricTitle: 'Left after bills',
    secondaryMetricTitle: 'Bills per month',
    categories: [
      'Groceries',
      'Housing & Bills',
      'Healthcare',
      'Shopping',
      'Investments',
      'Family Leisure'
    ],
    defaultWallets: [
      { name: 'Groceries & Provisions', category: 'Groceries', budget_limit: 12000, icon: 'ShoppingBag', color: '#10B981' },
      { name: 'Rent & Utilities', category: 'Housing & Bills', budget_limit: 20000, icon: 'Home', color: '#3B82F6' },
      { name: 'Healthcare & Wellness', category: 'Healthcare', budget_limit: 5000, icon: 'HeartPulse', color: '#EC4899' },
      { name: 'Personal Lifestyle', category: 'Shopping', budget_limit: 8000, icon: 'ShoppingCart', color: '#F59E0B' }
    ],
    goalIdeas: [
      { title: 'Emergency fund (6 months)', target: 180000, category: 'Savings', icon: 'Target', note: 'Six months of spending for surprises' },
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
