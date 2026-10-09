export const DEMO_USER = {
  id: 'user-demo-01',
  email: '128003008@sastra.ac.in',
  full_name: 'Aditya Venkata Sai Burle',
  student_id: '128003008@sastra.ac.in',
  role: 'admin',
  account_type: 'Student Account',
  currency: 'INR',
  currency_symbol: '₹',
  total_balance: 2450.00
};

export const INITIAL_WALLETS = [
  {
    id: 'wallet-1',
    name: 'Food & Dining',
    category: 'Food & Dining',
    balance: 850,
    budget_limit: 2000,
    icon: 'ShoppingBag',
    color: '#10B981',
    cycle_days_left: 30,
    daily_avg: 1150,
    status: 'Good'
  },
  {
    id: 'wallet-2',
    name: 'Transportation',
    category: 'Transportation',
    balance: 450,
    budget_limit: 800,
    icon: 'Car',
    color: '#3B82F6',
    cycle_days_left: 30,
    daily_avg: 350,
    status: 'Good'
  },
  {
    id: 'wallet-3',
    name: 'Entertainment',
    category: 'Entertainment',
    balance: 200,
    budget_limit: 1000,
    icon: 'Gamepad2',
    color: '#A855F7',
    cycle_days_left: 30,
    daily_avg: 800,
    status: 'Low'
  },
  {
    id: 'wallet-4',
    name: 'Shopping & Utilities',
    category: 'Shopping',
    balance: 950,
    budget_limit: 1500,
    icon: 'ShoppingCart',
    color: '#F59E0B',
    cycle_days_left: 30,
    daily_avg: 400,
    status: 'Good'
  }
];

export const INITIAL_GOALS = [];

export const INITIAL_TRANSACTIONS = [];

export const GOAL_IDEAS = [
  {
    id: 'idea-1',
    title: 'Emergency Fund',
    amount: 5000,
    emoji: '🎯',
    label: 'Save ₹5,000 for emergency fund'
  },
  {
    id: 'idea-2',
    title: 'Semester Break Trip',
    amount: 20000,
    emoji: '✈️',
    label: '₹20,000 for next semester break trip'
  },
  {
    id: 'idea-3',
    title: 'New Laptop',
    amount: 50000,
    emoji: '💻',
    label: '₹50,000 for new laptop'
  },
  {
    id: 'idea-4',
    title: 'Course Materials',
    amount: 10000,
    emoji: '🎓',
    label: '₹10,000 for course materials'
  }
];

export const RECIPIENTS = [
  { id: 'rec-1', name: 'Alex Johnson', email: 'alex@xpense.app', initial: 'A', color: '#8B5CF6' },
  { id: 'rec-2', name: 'Ben Carter', email: 'ben@xpense.app', initial: 'B', color: '#F97316' },
  { id: 'rec-3', name: 'Chloe Davis', email: 'chloe@xpense.app', initial: 'C', color: '#3B82F6' },
  { id: 'rec-4', name: 'David Evans', email: 'david@xpense.app', initial: 'D', color: '#22C55E' },
  { id: 'rec-5', name: 'Emily White', email: 'emily@xpense.app', initial: 'E', color: '#EC4899' }
];

export const MERCHANTS = [
  { id: 'mer-1', name: 'The Coffee House', location: 'Mumbai, IN', verified: true },
  { id: 'mer-2', name: 'Campus Cafeteria', location: 'Main Block, Campus', verified: true },
  { id: 'mer-3', name: 'University Bookstore', location: 'Academic Wing', verified: true },
  { id: 'mer-4', name: 'Metro Fast Transit', location: 'Station Gate 2', verified: true }
];
