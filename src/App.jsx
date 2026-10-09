import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { walletService } from './services/walletService';
import { transactionService } from './services/transactionService';
import { savingsGoalService } from './services/savingsGoalService';
import { getPersonaConfig } from './data/personas';
import { computeStudentSummary } from './lib/studentMetrics';
import { formatINR } from './lib/format';

import AppSidebar from './components/AppSidebar';
import AppTopbar from './components/AppTopbar';
import MobileTabBar from './components/MobileTabBar';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import WalletsView from './components/WalletsView';
import GoalsView from './components/GoalsView';
import AnalyticsView from './components/AnalyticsView';
import PaymentsView from './components/PaymentsView';
import SettingsView from './components/SettingsView';
import AddTransactionModal from './components/AddTransactionModal';
import AddMoneyToBudgetModal from './components/AddMoneyToBudgetModal';
import AccountSwapperModal from './components/AccountSwapperModal';
import LandingPageView from './components/LandingPageView';
import Modal from './components/ui/Modal';

const ACCOUNT_TYPES = [
  { value: 'Student Account', title: 'Student', text: 'Pocket money, canteen, travel and semester savings' },
  { value: 'Personal Account', title: 'Personal', text: 'Salary, household bills and family savings' },
  { value: 'Corporate SaaS', title: 'Business', text: 'Company spending, team budgets and reserves' }
];

function AuthDialog({ open, mode, setMode, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('Student Account');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setError(''), [mode, open]);

  const submit = async (e, demo = false) => {
    e?.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (demo) await onSubmit({ mode: 'login', email: '128003008@sastra.ac.in', password: 'demo123' });
      else await onSubmit({ mode, email: email.trim(), password, name: name.trim(), accountType });
      setPassword('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={420}
      title={mode === 'login' ? 'Welcome back' : 'Create your account'}
      description={mode === 'login' ? 'Sign in to see your money.' : 'It takes less than a minute.'}
    >
      <div className="x-segmented x-segmented-full">
        <button type="button" className={`x-seg ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>Sign in</button>
        <button type="button" className={`x-seg ${mode === 'signup' ? 'is-active' : ''}`} onClick={() => setMode('signup')}>Create account</button>
      </div>

      <form onSubmit={submit} noValidate>
        {mode === 'signup' && (
          <>
            <div className="x-field">
              <label className="x-label" htmlFor="auth-name">Full name</label>
              <input id="auth-name" className="x-input" autoComplete="name" placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <fieldset className="x-field">
              <legend className="x-label">Who is this account for?</legend>
              <div className="x-radio-list">
                {ACCOUNT_TYPES.map((t) => (
                  <label key={t.value} className={`x-radio ${accountType === t.value ? 'is-active' : ''}`}>
                    <input type="radio" name="account-type" checked={accountType === t.value} onChange={() => setAccountType(t.value)} />
                    <span>
                      <span className="x-radio-title">{t.title}</span>
                      <span className="x-radio-sub">{t.text}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}
        <div className="x-field">
          <label className="x-label" htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" className="x-input" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="x-field">
          <label className="x-label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            className="x-input"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="x-error x-form-error" role="alert">
            <AlertCircle size={15} /> {error}
          </p>
        )}

        <button type="submit" className="x-btn x-btn-primary x-btn-block x-btn-lg" disabled={busy}>
          {busy && <Loader2 size={16} className="x-spin" />}
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {import.meta.env.DEV && mode === 'login' && (
          <button type="button" className="x-link x-center-block" onClick={(e) => submit(e, true)} disabled={busy}>
            Try the demo student account
          </button>
        )}
      </form>
    </Modal>
  );
}

export default function App() {
  const {
    user,
    loading: authLoading,
    updateProfile,
    signOut,
    signIn,
    signUp,
    switchAccount,
    removeSavedAccount,
    savedAccounts,
    refreshUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallets, setWallets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [txModalMode, setTxModalMode] = useState(null); // 'expense' | 'income' | null
  const [budgetToFill, setBudgetToFill] = useState(null);
  const [isAccountSwapperOpen, setIsAccountSwapperOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Show the boot screen only for the first session check, not during sign-in or account switches
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    if (!authLoading) setBooted(true);
  }, [authLoading]);

  const notify = useCallback((message, tone = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const userId = user?.id;
  const loadData = useCallback(async () => {
    if (!userId) {
      setWallets([]);
      setGoals([]);
      setTransactions([]);
      return;
    }
    try {
      const [w, g, t] = await Promise.all([
        walletService.getWallets(),
        savingsGoalService.getGoals(),
        transactionService.getTransactions()
      ]);
      setWallets(w || []);
      setGoals(g || []);
      setTransactions(t || []);
    } catch (err) {
      notify("We couldn't load your latest data. Please refresh the page.", 'error');
    } finally {
      setDataLoading(false);
    }
  }, [userId, notify]);

  useEffect(() => {
    setDataLoading(true);
    loadData();
  }, [loadData]);

  // Balances live on the profile, so refresh it together with the lists after every change
  const refreshAll = useCallback(async () => {
    await Promise.all([loadData(), refreshUser?.()]);
  }, [loadData, refreshUser]);

  const summary = useMemo(
    () => (user ? computeStudentSummary({ user, wallets, transactions, goals }) : null),
    [user, wallets, transactions, goals]
  );
  const persona = getPersonaConfig(user?.account_type);

  // ---- Money actions. They throw so each form can show the error next to the field. ----
  const recordTransaction = async (txData) => {
    const created = await transactionService.createTransaction(txData);
    await refreshAll();
    notify(
      txData.type === 'income'
        ? `${formatINR(txData.amount)} added. Put it into your budgets next.`
        : `${formatINR(txData.amount)} spent from ${txData.wallet_name || 'your balance'}`
    );
    return created;
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      await refreshAll();
      notify('Removed from your activity');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const addMoneyToBudget = async (walletId, amount, fromAvailable) => {
    const updated = await walletService.topUpWallet(walletId, amount, { fromAvailable });
    await refreshAll();
    notify(`${formatINR(amount)} added to ${updated?.name || 'your budget'}`);
  };

  const createBudget = async (data, startWith) => {
    const created = await walletService.createWallet({ ...data, balance: 0 });
    if (startWith > 0 && created?.id) {
      await walletService.topUpWallet(created.id, startWith, { fromAvailable: true });
    }
    await refreshAll();
    notify(`Budget "${data.name}" created`);
  };

  const updateWallet = async (id, data) => {
    await walletService.updateWallet(id, data);
    await refreshAll();
    notify('Budget updated');
  };

  const deleteWallet = async (id) => {
    try {
      await walletService.deleteWallet(id);
      await refreshAll();
      notify('Budget deleted');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const createGoal = async (data) => {
    await savingsGoalService.createGoal(data);
    await refreshAll();
    notify(`Goal "${data.title}" created`);
  };

  const contributeGoal = async (id, amount) => {
    const updated = await savingsGoalService.contributeToGoal(id, amount);
    await refreshAll();
    notify(`${formatINR(amount)} saved`);
    return updated;
  };

  const deleteGoal = async (id) => {
    try {
      await savingsGoalService.deleteGoal(id);
      await refreshAll();
      notify('Goal deleted');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleAuth = async ({ mode, email, password, name, accountType }) => {
    if (mode === 'login') await signIn(email, password);
    else await signUp(email, password, name, accountType);
    setIsAuthOpen(false);
    setActiveTab('dashboard');
  };

  const toastEl = toast && (
    <div className={`x-toast ${toast.tone === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">
      {toast.tone === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
      <span>{toast.message}</span>
    </div>
  );

  if (!booted) {
    return (
      <div className="x-boot">
        <span className="x-brand-mark x-pulse">X</span>
        <p className="x-muted">Opening Xpense…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="landing-layout-wrapper">
        {toastEl}
        <LandingPageView
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'login');
            setIsAuthOpen(true);
          }}
        />
        <AuthDialog open={isAuthOpen} mode={authMode} setMode={setAuthMode} onClose={() => setIsAuthOpen(false)} onSubmit={handleAuth} />
      </div>
    );
  }

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openExpense = () => setTxModalMode('expense');
  const openMoneyIn = () => setTxModalMode('income');

  return (
    <div className="x-app">
      {toastEl}

      <AppSidebar
        activeTab={activeTab}
        onTabChange={goTo}
        user={user}
        onLogout={signOut}
        onOpenAccountSwapper={() => setIsAccountSwapperOpen(true)}
      />

      <div className="x-main">
        <AppTopbar onAddExpense={openExpense} onAddMoneyIn={openMoneyIn} moneyInLabel={persona.copy.moneyInLabel} />

        <main className="x-content" key={activeTab}>
          {dataLoading ? (
            <div className="x-page" aria-busy="true">
              <div className="x-skel x-skel-title" />
              <div className="x-hero-row">
                <div className="x-skel x-skel-hero" />
                <div className="x-skel x-skel-hero" />
              </div>
              <div className="x-metrics">
                {[0, 1, 2, 3].map((i) => <div key={i} className="x-skel x-skel-metric" />)}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  user={user}
                  summary={summary}
                  transactions={transactions}
                  onNavigate={goTo}
                  onAddExpense={openExpense}
                  onAddMoneyIn={openMoneyIn}
                  onAddMoneyToBudget={setBudgetToFill}
                />
              )}
              {activeTab === 'wallets' && (
                <WalletsView
                  user={user}
                  summary={summary}
                  onCreateBudget={createBudget}
                  onUpdateWallet={updateWallet}
                  onDeleteWallet={deleteWallet}
                  onOpenAddMoney={setBudgetToFill}
                  onAddMoneyIn={openMoneyIn}
                />
              )}
              {activeTab === 'transactions' && (
                <TransactionsView transactions={transactions} onDeleteTransaction={deleteTransaction} onAddExpense={openExpense} notify={notify} />
              )}
              {activeTab === 'goals' && (
                <GoalsView
                  user={user}
                  goals={goals}
                  summary={summary}
                  onCreateGoal={createGoal}
                  onContributeGoal={contributeGoal}
                  onDeleteGoal={deleteGoal}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsView summary={summary} notify={notify} />}
              {activeTab === 'payments' && <PaymentsView user={user} wallets={wallets} onRecord={recordTransaction} notify={notify} />}
              {activeTab === 'settings' && <SettingsView user={user} onUpdateProfile={updateProfile} onSignOut={signOut} notify={notify} />}
            </>
          )}
        </main>
      </div>

      <MobileTabBar
        activeTab={activeTab}
        onTabChange={goTo}
        user={user}
        onLogout={signOut}
        onOpenAccountSwapper={() => setIsAccountSwapperOpen(true)}
      />

      <AddTransactionModal
        isOpen={Boolean(txModalMode)}
        mode={txModalMode || 'expense'}
        onClose={() => setTxModalMode(null)}
        wallets={wallets}
        incomeExamples={persona.copy.moneyInExamples}
        onSubmit={recordTransaction}
      />

      <AddMoneyToBudgetModal
        wallet={budgetToFill}
        notInBudget={summary?.notInBudget || 0}
        onClose={() => setBudgetToFill(null)}
        onSubmit={addMoneyToBudget}
      />

      <AccountSwapperModal
        isOpen={isAccountSwapperOpen}
        onClose={() => setIsAccountSwapperOpen(false)}
        currentUser={user}
        savedAccounts={savedAccounts}
        onSwitchAccount={async (targetEmail) => {
          await switchAccount(targetEmail);
          setActiveTab('dashboard');
          notify('Switched account');
        }}
        onRemoveAccount={(targetEmail) => {
          removeSavedAccount(targetEmail);
          notify('Removed from this device');
        }}
        onAddNewAccount={async ({ mode, email, password, fullName, accountType }) => {
          if (mode === 'login') await signIn(email, password);
          else await signUp(email, password, fullName, accountType);
          setActiveTab('dashboard');
          notify('Signed in');
        }}
      />
    </div>
  );
}
