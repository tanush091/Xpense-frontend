// Pure calculations behind the student dashboard. No React, no fetch — easy to test.
import { toNumber, txDate, isSameDay, formatINR, getBudgetHealth } from './format';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function sum(list, pick = (x) => x) {
  return list.reduce((acc, item) => acc + toNumber(pick(item)), 0);
}

function inMonth(date, year, month) {
  return date && date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Everything the student Home screen shows, in plain terms.
 *
 * Money model (matches the Spring Boot services):
 *   moneyYouHave   = profile total balance (money in − money out − savings)
 *   inBudgets      = sum of budget (wallet) balances
 *   notInBudget    = moneyYouHave − inBudgets   ("free" money not set aside yet)
 *   savedInGoals   = sum of goal current amounts (already taken out of moneyYouHave)
 */
export function computeStudentSummary({ user, wallets = [], transactions = [], goals = [], now = new Date() }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const daysLeft = lastDayOfMonth - now.getDate() + 1; // includes today

  const moneyYouHave = toNumber(user?.total_balance ?? user?.totalBalance);
  const inBudgets = sum(wallets, (w) => w.balance);
  const notInBudget = Math.max(0, moneyYouHave - inBudgets);
  const savedInGoals = sum(goals, (g) => g.current_amount ?? g.currentAmount);
  const monthlyPlan = sum(wallets, (w) => w.budget_limit ?? w.budgetLimit);

  const dated = transactions.map((t) => ({ ...t, _date: txDate(t) }));
  const expenses = dated.filter((t) => t.type === 'expense');
  const incomes = dated.filter((t) => t.type === 'income');

  const spentThisMonth = sum(expenses.filter((t) => inMonth(t._date, year, month)), (t) => t.amount);
  const moneyInThisMonth = sum(incomes.filter((t) => inMonth(t._date, year, month)), (t) => t.amount);
  const spentToday = sum(expenses.filter((t) => t._date && isSameDay(t._date, now)), (t) => t.amount);

  const prev = new Date(year, month - 1, 1);
  const spentLastMonth = sum(
    expenses.filter((t) => inMonth(t._date, prev.getFullYear(), prev.getMonth())),
    (t) => t.amount
  );

  // How much can be spent per day for the rest of the month without running out
  const safeToSpendToday = Math.max(0, Math.floor(moneyYouHave / Math.max(1, daysLeft)));
  const leftToday = Math.max(0, safeToSpendToday - spentToday);

  // Last 7 days, oldest first
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const amount = sum(expenses.filter((t) => t._date && isSameDay(t._date, day)), (t) => t.amount);
    last7Days.push({ label: i === 0 ? 'Today' : DAY_SHORT[day.getDay()], amount, isToday: i === 0 });
  }
  const weekAverage = Math.round(sum(last7Days, (d) => d.amount) / 7);

  // Where the money went this month
  const byCategory = {};
  expenses
    .filter((t) => inMonth(t._date, year, month))
    .forEach((t) => {
      const key = t.category || 'Other';
      byCategory[key] = (byCategory[key] || 0) + toNumber(t.amount);
    });
  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: spentThisMonth > 0 ? Math.round((amount / spentThisMonth) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Which weekday tends to cost the most (all recorded spending)
  const byWeekday = Array(7).fill(0);
  expenses.forEach((t) => {
    if (t._date) byWeekday[t._date.getDay()] += toNumber(t.amount);
  });
  const busiestIdx = byWeekday.indexOf(Math.max(...byWeekday));
  const busiestDay = expenses.length > 0 ? DAY_LONG[busiestIdx] : null;

  const spentByWallet = {};
  expenses
    .filter((t) => inMonth(t._date, year, month) && (t.wallet_id || t.walletId))
    .forEach((t) => {
      const id = t.wallet_id || t.walletId;
      spentByWallet[id] = (spentByWallet[id] || 0) + toNumber(t.amount);
    });

  const budgets = wallets.map((w) => {
    const left = toNumber(w.balance);
    const limit = toNumber(w.budget_limit ?? w.budgetLimit);
    const spent = spentByWallet[w.id] || 0;
    // A budget nobody has put money into yet is not a problem, just not started
    const health = left <= 0 && spent === 0
      ? { key: 'unfunded', label: 'Not filled yet', ratio: 0 }
      : getBudgetHealth(left, limit);
    return { ...w, left, limit, spent, health };
  });
  const budgetsNeedingAttention = budgets.filter((b) => b.health.key === 'low' || b.health.key === 'empty');

  const activeGoals = goals.filter((g) => (g.status || 'in_progress') !== 'completed');

  const setupSteps = [
    {
      id: 'money-in',
      title: 'Add your money',
      description: 'Record the pocket money or stipend you received this month.',
      done: incomes.length > 0 || moneyYouHave > 0
    },
    {
      id: 'budgets',
      title: 'Split it into budgets',
      description: 'Decide how much goes to food, travel, books and fun.',
      done: inBudgets > 0
    },
    {
      id: 'expense',
      title: 'Record what you spend',
      description: 'Each expense comes out of one budget, so you always know what is left.',
      done: expenses.length > 0
    },
    {
      id: 'goal',
      title: 'Start a savings goal',
      description: 'Put aside money for a trip, a laptop or an emergency.',
      done: goals.length > 0
    }
  ];

  const summary = {
    daysLeft,
    moneyYouHave,
    inBudgets,
    notInBudget,
    savedInGoals,
    monthlyPlan,
    spentThisMonth,
    spentLastMonth,
    moneyInThisMonth,
    spentToday,
    safeToSpendToday,
    leftToday,
    last7Days,
    weekAverage,
    categoryBreakdown,
    busiestDay,
    budgets,
    budgetsNeedingAttention,
    activeGoals,
    setupSteps,
    setupComplete: setupSteps.every((s) => s.done),
    hasActivity: transactions.length > 0
  };
  summary.tips = buildTips(summary);
  return summary;
}

/** Up to three short, specific tips in plain language (DESIGN §10). */
export function buildTips(s) {
  const tips = [];

  const emptiest = [...s.budgetsNeedingAttention].sort((a, b) => a.health.ratio - b.health.ratio)[0];
  if (emptiest) {
    tips.push({
      tone: emptiest.health.key === 'empty' ? 'danger' : 'warn',
      text: `Your ${emptiest.name} budget has ${formatINR(emptiest.left)} left. Add money to it or slow down on ${emptiest.category?.toLowerCase() || 'this'} for a few days.`
    });
  }

  if (s.spentToday > s.safeToSpendToday && s.safeToSpendToday > 0) {
    tips.push({
      tone: 'warn',
      text: `You've spent ${formatINR(s.spentToday)} today, more than your safe amount of ${formatINR(s.safeToSpendToday)}. Spending a little less tomorrow will balance it out.`
    });
  }

  if (s.notInBudget > 0) {
    tips.push({
      tone: 'info',
      text: `${formatINR(s.notInBudget)} isn't in any budget yet. Put it into a budget or a savings goal so every rupee has a job.`
    });
  }

  if (s.spentLastMonth > 0 && s.spentThisMonth > 0) {
    const diff = Math.round(((s.spentThisMonth - s.spentLastMonth) / s.spentLastMonth) * 100);
    if (diff < 0) {
      tips.push({ tone: 'good', text: `You've spent ${Math.abs(diff)}% less than last month so far. Nice work.` });
    } else if (diff > 0) {
      tips.push({ tone: 'warn', text: `You've already spent ${diff}% more than all of last month.` });
    }
  }

  if (s.categoryBreakdown.length > 0) {
    const top = s.categoryBreakdown[0];
    tips.push({ tone: 'info', text: `Most of your spending this month went to ${top.category} (${top.percent}%).` });
  }

  if (tips.length === 0) {
    tips.push({
      tone: 'info',
      text: 'Start by adding the money you received this month. Xpense will then show how much you can safely spend each day.'
    });
  }

  return tips.slice(0, 3);
}
