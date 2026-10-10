import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [savedAccounts, setSavedAccounts] = useState([]);

  const refreshSavedAccounts = () => {
    setSavedAccounts(authService.getSavedAccountsList());
  };

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      refreshSavedAccounts();
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    refreshSavedAccounts();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('xpense_unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('xpense_unauthorized', handleUnauthorized);
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.signIn(email, password);
      setUser(loggedUser);
      refreshSavedAccounts();
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, accountType) => {
    setLoading(true);
    try {
      const newUser = await authService.signUp(email, password, fullName, accountType);
      setUser(newUser);
      refreshSavedAccounts();
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      refreshSavedAccounts();
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = async (email) => {
    setLoading(true);
    try {
      const switched = await authService.switchAccount(email);
      setUser(switched);
      return switched;
    } finally {
      refreshSavedAccounts();
      setLoading(false);
    }
  };

  const removeSavedAccount = (email) => {
    const updated = authService.removeSavedAccount(email);
    setSavedAccounts(updated);
    return updated;
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setUser(prev => ({ ...prev, ...updated }));
    refreshSavedAccounts();
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        savedAccounts,
        signIn,
        signUp,
        signOut,
        switchAccount,
        removeSavedAccount,
        refreshSavedAccounts,
        updateProfile,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
