import { apiClient } from './apiClient';

const LOCAL_STORAGE_WALLETS_KEY = 'xpense_wallets';

export function normalizeWallet(w) {
  if (!w) return null;
  const budgetLimit = w.budget_limit !== undefined 
    ? parseFloat(w.budget_limit) 
    : (w.budgetLimit !== undefined ? parseFloat(w.budgetLimit) : 1000);
  const cycleDaysLeft = w.cycle_days_left !== undefined 
    ? w.cycle_days_left 
    : (w.cycleDaysLeft !== undefined ? w.cycleDaysLeft : 30);
  const dailyAvg = w.daily_avg !== undefined 
    ? parseFloat(w.daily_avg) 
    : (w.dailyAvg !== undefined ? parseFloat(w.dailyAvg) : Math.round(budgetLimit / 30));
  const userId = w.user_id || w.userId || '';
  const createdAt = w.created_at || w.createdAt || new Date().toISOString();
  const updatedAt = w.updated_at || w.updatedAt || new Date().toISOString();

  const balance = parseFloat(w.balance || 0);
  let derivedStatus = 'Good';
  if (budgetLimit > 0) {
    const ratio = balance / budgetLimit;
    if (ratio < 0.10) {
      derivedStatus = 'Warning';
    } else if (ratio < 0.30) {
      derivedStatus = 'Low';
    } else {
      derivedStatus = 'Good';
    }
  } else {
    derivedStatus = balance > 0 ? 'Good' : 'Warning';
  }

  return {
    ...w,
    status: w.status || derivedStatus,
    healthStatus: derivedStatus,
    budget_limit: budgetLimit,
    budgetLimit: budgetLimit,
    cycle_days_left: cycleDaysLeft,
    cycleDaysLeft: cycleDaysLeft,
    daily_avg: dailyAvg,
    dailyAvg: dailyAvg,
    user_id: userId,
    userId: userId,
    created_at: createdAt,
    createdAt: createdAt,
    updated_at: updatedAt,
    updatedAt: updatedAt
  };
}

function getLocalWallets() {
  const stored = localStorage.getItem(LOCAL_STORAGE_WALLETS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeWallet) : [];
    } catch (e) {
      console.error('Failed to parse wallets', e);
    }
  }
  return [];
}

function saveLocalWallets(wallets) {
  localStorage.setItem(LOCAL_STORAGE_WALLETS_KEY, JSON.stringify(wallets));
}

export const walletService = {
  async getWallets() {
    try {
      const data = await apiClient.get('/wallets');
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeWallet);
        saveLocalWallets(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Backend /api/wallets unreachable, using local store:', err.message);
    }
    return getLocalWallets();
  },

  async getWalletById(id) {
    try {
      const data = await apiClient.get(`/wallets/${id}`);
      if (data) return normalizeWallet(data);
    } catch (err) {
      console.warn(`Backend /api/wallets/${id} unreachable, using local store:`, err.message);
    }
    const wallets = getLocalWallets();
    return wallets.find(w => w.id === id) || null;
  },

  async createWallet(walletData) {
    const payload = {
      ...walletData,
      budgetLimit: walletData.budget_limit || walletData.budgetLimit || 1000,
      budget_limit: walletData.budget_limit || walletData.budgetLimit || 1000,
      userId: walletData.user_id || walletData.userId,
      user_id: walletData.user_id || walletData.userId
    };

    try {
      const data = await apiClient.post('/wallets', payload);
      if (data) {
        const norm = normalizeWallet(data);
        const local = getLocalWallets();
        saveLocalWallets([norm, ...local]);
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend create wallet failed, using local store:', err.message);
    }

    const wallets = getLocalWallets();
    const newWallet = normalizeWallet({
      id: 'wallet-' + Date.now(),
      created_at: new Date().toISOString(),
      balance: parseFloat(walletData.balance || 0),
      budget_limit: parseFloat(walletData.budget_limit || walletData.budgetLimit || 1000),
      cycle_days_left: 30,
      daily_avg: Math.round(parseFloat(walletData.budget_limit || walletData.budgetLimit || 1000) / 30),
      status: 'Good',
      icon: walletData.icon || 'Wallet',
      color: walletData.color || '#3B82F6',
      ...walletData
    });
    const updated = [newWallet, ...wallets];
    saveLocalWallets(updated);
    return newWallet;
  },

  async updateWallet(id, updates) {
    const payload = {
      ...updates,
      ...(updates.budget_limit !== undefined ? { budgetLimit: updates.budget_limit, budget_limit: updates.budget_limit } : {})
    };

    try {
      const data = await apiClient.put(`/wallets/${id}`, payload);
      if (data) {
        const norm = normalizeWallet(data);
        const local = getLocalWallets();
        saveLocalWallets(local.map(w => (w.id === id ? norm : w)));
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend update wallet failed, using local store:', err.message);
    }

    const wallets = getLocalWallets();
    const updated = wallets.map(w => (w.id === id ? normalizeWallet({ ...w, ...updates }) : w));
    saveLocalWallets(updated);
    return updated.find(w => w.id === id);
  },

  /**
   * Adds money to a wallet. fromAvailable = true moves money that is not yet in any
   * wallet (total balance unchanged); false records new money arriving into the wallet.
   */
  async topUpWallet(id, amount, { fromAvailable = false } = {}) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid top-up amount');
    }

    try {
      const data = await apiClient.post(`/wallets/${id}/topup`, { amount: numAmount, from_available: fromAvailable });
      if (data) {
        const norm = normalizeWallet(data);
        const local = getLocalWallets();
        saveLocalWallets(local.map(w => (w.id === id ? norm : w)));
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend topup failed, using local store:', err.message);
    }

    const wallets = getLocalWallets();
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = (parseFloat(wallet.balance) || 0) + numAmount;
    let newStatus = wallet.status;
    if (wallet.budget_limit) {
      const ratio = newBalance / parseFloat(wallet.budget_limit);
      if (ratio >= 0.3) newStatus = 'Good';
    }

    const updatedWallet = normalizeWallet({
      ...wallet,
      balance: newBalance,
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    const updated = wallets.map(w => (w.id === id ? updatedWallet : w));
    saveLocalWallets(updated);
    return updatedWallet;
  },

  async deductFromWallet(id, amount) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid deduction amount');
    }

    const wallets = getLocalWallets();
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) throw new Error('Wallet not found');

    const currentBalance = parseFloat(wallet.balance) || 0;
    if (currentBalance < numAmount) {
      throw new Error(`Insufficient balance in ${wallet.name} wallet`);
    }

    const newBalance = currentBalance - numAmount;
    let newStatus = wallet.status;
    if (wallet.budget_limit) {
      const ratio = newBalance / parseFloat(wallet.budget_limit);
      if (ratio <= 0.1) newStatus = 'Warning';
      else if (ratio <= 0.25) newStatus = 'Low';
    }

    const updatedWallet = normalizeWallet({
      ...wallet,
      balance: newBalance,
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    try {
      await apiClient.put(`/wallets/${id}`, { balance: newBalance, status: newStatus });
    } catch {
      // Local fallback
    }

    const updated = wallets.map(w => (w.id === id ? updatedWallet : w));
    saveLocalWallets(updated);
    return updatedWallet;
  },

  async deleteWallet(id) {
    try {
      await apiClient.delete(`/wallets/${id}`);
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend delete wallet failed, using local store:', err.message);
    }
    const wallets = getLocalWallets();
    const updated = wallets.filter(w => w.id !== id);
    saveLocalWallets(updated);
    return true;
  }
};
