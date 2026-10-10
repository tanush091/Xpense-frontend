import { apiClient } from './apiClient';

const LOCAL_STORAGE_USER_KEY = 'xpense_current_user';

export function normalizeUser(raw) {
  if (!raw) return null;
  const fullName = raw.full_name || raw.fullName || raw.name || '';
  const totalBalance = raw.total_balance !== undefined 
    ? raw.total_balance 
    : (raw.totalBalance !== undefined ? raw.totalBalance : 0);
  const accountType = raw.account_type || raw.accountType || 'Student Account';
  const studentId = raw.student_id || raw.studentId || raw.email || '';
  const avatarUrl = raw.avatar_url || raw.avatarUrl || '';
  const currencySymbol = raw.currency_symbol || raw.currencySymbol || '₹';
  const currency = raw.currency || 'INR';
  const role = raw.role || 'user';

  const university = raw.university || '';
  const semester = raw.semester || '';

  return {
    ...raw,
    full_name: fullName,
    fullName: fullName,
    name: fullName,
    total_balance: totalBalance,
    totalBalance: totalBalance,
    account_type: accountType,
    accountType: accountType,
    student_id: studentId,
    studentId: studentId,
    university: university,
    semester: semester,
    avatar_url: avatarUrl,
    avatarUrl: avatarUrl,
    currency_symbol: currencySymbol,
    currencySymbol: currencySymbol,
    currency: currency,
    role: role
  };
}

export const SAVED_ACCOUNTS_KEY = 'xpense_saved_accounts';

export function getSavedAccounts() {
  try {
    const list = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

export function saveAccountToStorage(user, token) {
  if (!user || !user.email) return;
  const accounts = getSavedAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === user.email.toLowerCase());
  const entry = {
    id: user.id,
    email: user.email,
    fullName: user.full_name || user.fullName || user.name || user.email,
    accountType: user.account_type || user.accountType || 'Student Account',
    university: user.university || '',
    semester: user.semester || '',
    token: token || apiClient.getToken(),
    lastUsed: Date.now()
  };
  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...entry };
  } else {
    accounts.push(entry);
  }
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function removeAccountFromStorage(email) {
  const accounts = getSavedAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}

export const authService = {
  async getCurrentUser() {
    const token = apiClient.getToken();
    if (!token) {
      return null;
    }

    try {
      const data = await apiClient.get('/auth/me');
      if (data && data.email) {
        const normalized = normalizeUser(data);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(normalized));
        saveAccountToStorage(normalized, token);
        return normalized;
      }
    } catch (err) {
      console.warn('Backend /api/auth/me failed:', err.message);
      if (err.status === 401) {
        await this.signOut();
        return null;
      }
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (cached) {
      try {
        const normalized = normalizeUser(JSON.parse(cached));
        saveAccountToStorage(normalized, token);
        return normalized;
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
    return null;
  },

  async signIn(email, password) {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    const res = await apiClient.post('/auth/login', { 
      email: cleanEmail, 
      password 
    });

    if (res && res.token) {
      apiClient.setToken(res.token);
      const user = normalizeUser(res.user);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      saveAccountToStorage(user, res.token);
      return user;
    }
    throw new Error('Authentication failed: no token received from server.');
  },

  async signUp(email, password, fullName, accountType = 'Student Account') {
    const cleanEmail = (email || '').trim();
    const cleanName = (fullName || '').trim();

    if (!cleanEmail || !password || !cleanName) {
      throw new Error('Please provide full name, email, and password.');
    }

    const res = await apiClient.post('/auth/register', {
      email: cleanEmail,
      password,
      fullName: cleanName,
      full_name: cleanName,
      name: cleanName,
      accountType: accountType || 'Student Account',
      account_type: accountType || 'Student Account'
    });

    if (res && res.token) {
      apiClient.setToken(res.token);
      const user = normalizeUser(res.user);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      saveAccountToStorage(user, res.token);
      return user;
    }
    throw new Error('Registration failed: no token received from server.');
  },

  async signOut() {
    // Sign out of every account on this device: keep the list for convenience, but forget all saved
    // logins so no account can be reopened without its password
    const accounts = getSavedAccounts().map((a) => ({ ...a, token: null }));
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    apiClient.setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    // Also clear cached user-specific data to prevent leakage between accounts
    localStorage.removeItem('xpense_wallets');
    localStorage.removeItem('xpense_transactions');
    localStorage.removeItem('xpense_savings_goals');
    return true;
  },

  /**
   * Switches to another account saved on this device. The saved login is checked quietly first;
   * if it has expired, the current session is left untouched and the user is asked to sign in.
   */
  async switchAccount(email) {
    const target = getSavedAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
    const needsPassword = () => {
      const err = new Error('Please sign in to this account again.');
      err.needsPassword = true;
      return err;
    };
    if (!target) throw new Error('This account is no longer on this device.');
    if (!target.token) throw needsPassword();

    let profile = null;
    try {
      const res = await fetch(`${apiClient.baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${target.token}` } });
      const json = res.ok ? await res.json() : null;
      profile = json?.data || null;
    } catch {
      profile = null;
    }
    if (!profile || profile.email?.toLowerCase() !== target.email.toLowerCase()) {
      // Forget the stale login; keep the account listed so the user can sign in again
      const accounts = getSavedAccounts().map((a) => (a.email.toLowerCase() === target.email.toLowerCase() ? { ...a, token: null } : a));
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
      throw needsPassword();
    }

    apiClient.setToken(target.token);
    localStorage.removeItem('xpense_wallets');
    localStorage.removeItem('xpense_transactions');
    localStorage.removeItem('xpense_savings_goals');
    const user = normalizeUser(profile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    saveAccountToStorage(user, target.token);
    return user;
  },

  getSavedAccountsList() {
    return getSavedAccounts();
  },

  removeSavedAccount(email) {
    return removeAccountFromStorage(email);
  },

  async updateProfile(updates) {
    const payload = {
      ...updates,
      fullName: updates.full_name || updates.fullName || updates.name,
      full_name: updates.full_name || updates.fullName || updates.name,
      studentId: updates.student_id || updates.studentId,
      student_id: updates.student_id || updates.studentId,
      university: updates.university || '',
      semester: updates.semester || ''
    };

    const data = await apiClient.put('/profile', payload);
    if (data) {
      const normalized = normalizeUser(data);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(normalized));
      saveAccountToStorage(normalized, apiClient.getToken());
      return normalized;
    }
    const localNormalized = normalizeUser(updates);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localNormalized));
    saveAccountToStorage(localNormalized, apiClient.getToken());
    return localNormalized;
  }
};
