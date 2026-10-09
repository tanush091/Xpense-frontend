import { apiClient } from './apiClient';

const LOCAL_STORAGE_BUDGETS_KEY = 'xpense_budgets';

const INITIAL_BUDGETS = [
  { id: 'b-1', category: 'Food & Dining', limit_amount: 2000, spent_amount: 1150, period: 'monthly' },
  { id: 'b-2', category: 'Transportation', limit_amount: 800, spent_amount: 350, period: 'monthly' },
  { id: 'b-3', category: 'Entertainment', limit_amount: 1000, spent_amount: 800, period: 'monthly' },
  { id: 'b-4', category: 'Shopping', limit_amount: 1500, spent_amount: 550, period: 'monthly' }
];

function getLocalBudgets() {
  const stored = localStorage.getItem(LOCAL_STORAGE_BUDGETS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse budgets', e);
    }
  }
  localStorage.setItem(LOCAL_STORAGE_BUDGETS_KEY, JSON.stringify(INITIAL_BUDGETS));
  return INITIAL_BUDGETS;
}

function saveLocalBudgets(budgets) {
  localStorage.setItem(LOCAL_STORAGE_BUDGETS_KEY, JSON.stringify(budgets));
}

export const budgetService = {
  async getBudgets() {
    try {
      const data = await apiClient.get('/budgets');
      if (Array.isArray(data) && data.length > 0) {
        saveLocalBudgets(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /api/budgets unreachable, using local store:', err.message);
    }
    return getLocalBudgets();
  },

  async upsertBudget(budgetData) {
    try {
      const data = await apiClient.post('/budgets', {
        category: budgetData.category,
        limit_amount: parseFloat(budgetData.limit_amount || 1000),
        spent_amount: parseFloat(budgetData.spent_amount || 0),
        period: budgetData.period || 'monthly'
      });
      if (data) {
        const budgets = getLocalBudgets();
        const idx = budgets.findIndex(b => b.category === data.category);
        if (idx >= 0) budgets[idx] = data;
        else budgets.push(data);
        saveLocalBudgets(budgets);
        return data;
      }
    } catch (err) {
      console.warn('Backend upsert budget failed, using local store:', err.message);
    }

    const budgets = getLocalBudgets();
    const existingIndex = budgets.findIndex(b => b.category === budgetData.category);
    if (existingIndex >= 0) {
      budgets[existingIndex] = { ...budgets[existingIndex], ...budgetData };
    } else {
      budgets.push({
        id: 'b-' + Date.now(),
        spent_amount: 0,
        period: 'monthly',
        ...budgetData
      });
    }
    saveLocalBudgets(budgets);
    return budgetData;
  },

  async deleteBudget(id) {
    try {
      await apiClient.delete(`/budgets/${id}`);
    } catch (err) {
      console.warn('Backend delete budget failed, using local store:', err.message);
    }

    const budgets = getLocalBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    saveLocalBudgets(filtered);
    return true;
  }
};
