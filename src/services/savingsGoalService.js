import { apiClient } from './apiClient';

const LOCAL_STORAGE_GOALS_KEY = 'xpense_savings_goals';

export function normalizeGoal(g) {
  if (!g) return null;
  const targetAmount = g.target_amount !== undefined 
    ? parseFloat(g.target_amount) 
    : (g.targetAmount !== undefined ? parseFloat(g.targetAmount) : 5000);
  const currentAmount = g.current_amount !== undefined 
    ? parseFloat(g.current_amount) 
    : (g.currentAmount !== undefined ? parseFloat(g.currentAmount) : 0);
  const targetDate = g.target_date || g.targetDate || null;
  const userId = g.user_id || g.userId || '';
  const createdAt = g.created_at || g.createdAt || new Date().toISOString();
  const updatedAt = g.updated_at || g.updatedAt || new Date().toISOString();

  return {
    ...g,
    target_amount: targetAmount,
    targetAmount: targetAmount,
    current_amount: currentAmount,
    currentAmount: currentAmount,
    target_date: targetDate,
    targetDate: targetDate,
    user_id: userId,
    userId: userId,
    created_at: createdAt,
    createdAt: createdAt,
    updated_at: updatedAt,
    updatedAt: updatedAt
  };
}

function getLocalGoals() {
  const stored = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeGoal) : [];
    } catch (e) {
      console.error('Failed to parse savings goals', e);
    }
  }
  return [];
}

function saveLocalGoals(goals) {
  localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(goals));
}

export const savingsGoalService = {
  async getGoals() {
    try {
      const data = await apiClient.get('/savings-goals');
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeGoal);
        saveLocalGoals(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Backend /api/savings-goals unreachable, using local store:', err.message);
    }
    return getLocalGoals();
  },

  async createGoal(goalData) {
    const payload = {
      title: goalData.title,
      target_amount: parseFloat(goalData.target_amount || goalData.targetAmount || 5000),
      targetAmount: parseFloat(goalData.target_amount || goalData.targetAmount || 5000),
      current_amount: parseFloat(goalData.current_amount || goalData.currentAmount || 0),
      currentAmount: parseFloat(goalData.current_amount || goalData.currentAmount || 0),
      target_date: goalData.target_date || goalData.targetDate || null,
      targetDate: goalData.target_date || goalData.targetDate || null,
      icon: goalData.icon || 'Target',
      category: goalData.category || 'Savings',
      is_emergency: Boolean(goalData.is_emergency),
      status: 'in_progress',
      userId: goalData.user_id || goalData.userId,
      user_id: goalData.user_id || goalData.userId
    };

    try {
      const data = await apiClient.post('/savings-goals', payload);
      if (data) {
        const norm = normalizeGoal(data);
        const local = getLocalGoals();
        saveLocalGoals([norm, ...local]);
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend create goal failed, using local store:', err.message);
    }

    const goals = getLocalGoals();
    const newGoal = normalizeGoal({
      id: 'goal-' + Date.now(),
      created_at: new Date().toISOString(),
      ...payload
    });
    const updated = [newGoal, ...goals];
    saveLocalGoals(updated);
    return newGoal;
  },

  async contributeToGoal(id, amount) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid deposit amount');
    }

    try {
      const data = await apiClient.post(`/savings-goals/${id}/deposit`, { amount: numAmount });
      if (data) {
        const norm = normalizeGoal(data);
        const local = getLocalGoals();
        saveLocalGoals(local.map(g => (g.id === id ? norm : g)));
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend deposit failed, using local store:', err.message);
    }

    const goals = getLocalGoals();
    const updated = goals.map(g => {
      if (g.id === id) {
        const newCurrent = parseFloat(g.current_amount || 0) + numAmount;
        const isCompleted = newCurrent >= parseFloat(g.target_amount);
        return normalizeGoal({
          ...g,
          current_amount: newCurrent,
          status: isCompleted ? 'completed' : 'in_progress'
        });
      }
      return g;
    });
    saveLocalGoals(updated);
    return updated.find(g => g.id === id);
  },

  async updateGoal(id, updates) {
    try {
      const data = await apiClient.put(`/savings-goals/${id}`, updates);
      if (data) {
        const norm = normalizeGoal(data);
        const local = getLocalGoals();
        saveLocalGoals(local.map(g => (g.id === id ? norm : g)));
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend update goal failed, using local store:', err.message);
    }

    const goals = getLocalGoals();
    const updated = goals.map(g => (g.id === id ? normalizeGoal({ ...g, ...updates }) : g));
    saveLocalGoals(updated);
    return updated.find(g => g.id === id);
  },

  async deleteGoal(id) {
    try {
      await apiClient.delete(`/savings-goals/${id}`);
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend delete goal failed, using local store:', err.message);
    }
    const goals = getLocalGoals();
    const updated = goals.filter(g => g.id !== id);
    saveLocalGoals(updated);
    return true;
  }
};
