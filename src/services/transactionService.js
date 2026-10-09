import { apiClient } from './apiClient';

const LOCAL_STORAGE_TX_KEY = 'xpense_transactions';

export function normalizeTransaction(t) {
  if (!t) return null;
  const walletId = t.wallet_id || t.walletId || null;
  const walletName = t.wallet_name || t.walletName || null;
  const paymentMethod = t.payment_method || t.paymentMethod || 'UPI';
  const userId = t.user_id || t.userId || '';
  const createdAt = t.created_at || t.createdAt || t.date || new Date().toISOString();
  const date = t.date || createdAt;
  const amount = parseFloat(t.amount || 0);

  return {
    ...t,
    amount,
    wallet_id: walletId,
    walletId: walletId,
    wallet_name: walletName,
    walletName: walletName,
    payment_method: paymentMethod,
    paymentMethod: paymentMethod,
    user_id: userId,
    userId: userId,
    created_at: createdAt,
    createdAt: createdAt,
    date
  };
}

function getLocalTransactions() {
  const stored = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeTransaction) : [];
    } catch (e) {
      console.error('Failed to parse transactions', e);
    }
  }
  return [];
}

function saveLocalTransactions(txs) {
  localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(txs));
}

export const transactionService = {
  async getTransactions(filter = {}) {
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.type) params.type = filter.type;
      if (filter.wallet_id || filter.walletId) params.walletId = filter.wallet_id || filter.walletId;

      const data = await apiClient.get('/transactions', params);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeTransaction);
        saveLocalTransactions(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Backend /api/transactions unreachable, using local store:', err.message);
    }

    let txs = getLocalTransactions();
    if (filter.category) {
      txs = txs.filter(t => t.category?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.type) {
      txs = txs.filter(t => t.type === filter.type);
    }
    if (filter.wallet_id || filter.walletId) {
      const wid = filter.wallet_id || filter.walletId;
      txs = txs.filter(t => t.wallet_id === wid);
    }
    return txs;
  },

  async getTransactionById(id) {
    try {
      const data = await apiClient.get(`/transactions/${id}`);
      if (data) return normalizeTransaction(data);
    } catch (err) {
      console.warn(`Backend /api/transactions/${id} unreachable, using local store:`, err.message);
    }

    const txs = getLocalTransactions();
    return txs.find(t => t.id === id) || null;
  },

  async createTransaction(txData) {
    const amount = parseFloat(txData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid transaction amount');
    }

    const payload = {
      title: txData.title,
      amount: amount,
      type: txData.type || 'expense',
      category: txData.category || 'General',
      wallet_id: txData.wallet_id || txData.walletId || null,
      walletId: txData.wallet_id || txData.walletId || null,
      wallet_name: txData.wallet_name || txData.walletName || null,
      walletName: txData.wallet_name || txData.walletName || null,
      recipient: txData.recipient || null,
      merchant: txData.merchant || null,
      payment_method: txData.payment_method || txData.paymentMethod || 'UPI',
      paymentMethod: txData.payment_method || txData.paymentMethod || 'UPI',
      status: txData.status || 'completed',
      note: txData.note || null,
      userId: txData.user_id || txData.userId,
      user_id: txData.user_id || txData.userId
    };

    // Attempt backend first
    try {
      const data = await apiClient.post('/transactions', payload);
      if (data) {
        const norm = normalizeTransaction(data);
        const local = getLocalTransactions();
        saveLocalTransactions([norm, ...local]);
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend create transaction failed, falling back to local:', err.message);
    }

    const txs = getLocalTransactions();
    const newTx = normalizeTransaction({
      id: 'tx-' + Date.now(),
      created_at: new Date().toISOString(),
      date: new Date().toISOString(),
      ...payload
    });

    const updated = [newTx, ...txs];
    saveLocalTransactions(updated);
    return newTx;
  },

  async sendMoneyTransfer(transferData) {
    try {
      const data = await apiClient.post('/transactions/transfer', transferData);
      if (data) {
        const norm = normalizeTransaction(data);
        const local = getLocalTransactions();
        saveLocalTransactions([norm, ...local]);
        return norm;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend transfer failed, using fallback:', err.message);
    }

    return this.createTransaction({
      title: `Transfer to ${transferData.recipient}`,
      amount: transferData.amount,
      type: 'expense',
      category: 'Transfers',
      wallet_id: transferData.wallet_id || transferData.walletId,
      recipient: transferData.recipient,
      payment_method: transferData.payment_method || 'UPI',
      note: transferData.note
    });
  },

  async deleteTransaction(id) {
    try {
      await apiClient.delete(`/transactions/${id}`);
    } catch (err) {
      if (!err.isNetworkError) throw err;
      console.warn('Backend delete transaction failed, using local store:', err.message);
    }
    const txs = getLocalTransactions();
    const updated = txs.filter(t => t.id !== id);
    saveLocalTransactions(updated);
    return true;
  }
};
