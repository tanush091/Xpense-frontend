// Calculations every dashboard shares. Pure functions: no React, no fetch — easy to test.
import { toNumber, txDate, isSameDay, getBudgetHealth } from '../../lib/format';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function sum(list, pick = (x) => x) {
  return list.reduce((acc, item) => acc + toNumber(pick(item)), 0);
}

export function inMonth(date, year, month) {
  return Boolean(date) && date.getFullYear() === year && date.getMonth() === month;
}

/** Money out is anything that isn't money in (expenses, bill payments, transfers). */
export const isMoneyOut = (t) => t.type !== 'income';

/**
 * Average monthly spending over the last `months` full months that had any spending.
 * Falls back to this month's spending so far when there is no earlier history.
 */
export function averageMonthlySpending(transactions, now = new Date(), months = 3) {
  const totals = [];
  for (let i = 1; i <= months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = sum(
      transactions.filter((t) => isMoneyOut(t) && inMonth(txDate(t), d.getFullYear(), d.getMonth())),
      (t) => t.amount
    );
    if (total > 0) totals.push(total);
  }
  if (totals.length > 0) return totals.reduce((a, b) => a + b, 0) / totals.length;
  return sum(
    transactions.filter((t) => isMoneyOut(t) && inMonth(txDate(t), now.getFullYear(), now.getMonth())),
    (t) => t.amount
  );
}

/**
 * The money model shared by all dashboards (matches the Spring Boot services):
 *   moneyYouHave = profile total balance (money in − money out − savings)
 *   inBudgets    = sum of budget (wallet) balances
 *   notInBudget  = moneyYouHave − inBudgets   (money not set aside yet)
 *   savedInGoals = sum of goal amounts (already taken out of moneyYouHave)
 */
export function computeBaseSummary({ user, wallets = [], transactions = [], goals = [], now = new Date() }) {
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
  const moneyOut = dated.filter(isMoneyOut);
  const moneyIn = dated.filter((t) => t.type === 'income');

  const spentThisMonth = sum(moneyOut.filter((t) => inMonth(t._date, year, month)), (t) => t.amount);
  const moneyInThisMonth = sum(moneyIn.filter((t) => inMonth(t._date, year, month)), (t) => t.amount);
  const spentToday = sum(moneyOut.filter((t) => t._date && isSameDay(t._date, now)), (t) => t.amount);
  const prev = new Date(year, month - 1, 1);
  const spentLastMonth = sum(
    moneyOut.filter((t) => inMonth(t._date, prev.getFullYear(), prev.getMonth())),
    (t) => t.amount
  );

  // Last 7 days, oldest first
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const amount = sum(moneyOut.filter((t) => t._date && isSameDay(t._date, day)), (t) => t.amount);
    last7Days.push({ label: i === 0 ? 'Today' : DAY_SHORT[day.getDay()], amount, isToday: i === 0 });
  }
  const weekAverage = Math.round(sum(last7Days, (d) => d.amount) / 7);

  // Where the money went this month
  const byCategory = {};
  moneyOut
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
  moneyOut.forEach((t) => {
    if (t._date) byWeekday[t._date.getDay()] += toNumber(t.amount);
  });
  const busiestDay = moneyOut.length > 0 ? DAY_LONG[byWeekday.indexOf(Math.max(...byWeekday))] : null;

  // Budgets with plain-language health
  const spentByWallet = {};
  moneyOut
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
    const health =
      left <= 0 && spent === 0 ? { key: 'unfunded', label: 'Not filled yet', ratio: 0 } : getBudgetHealth(left, limit);
    return { ...w, left, limit, spent, health };
  });
  const budgetsNeedingAttention = budgets.filter((b) => b.health.key === 'low' || b.health.key === 'empty');

  const activeGoals = goals.filter((g) => (g.status || 'in_progress') !== 'completed');

  return {
    now,
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
    last7Days,
    weekAverage,
    categoryBreakdown,
    busiestDay,
    budgets,
    budgetsNeedingAttention,
    activeGoals,
    hasMoneyIn: moneyIn.length > 0,
    hasMoneyOut: moneyOut.length > 0,
    hasActivity: transactions.length > 0
  };
}

/** Tips every dashboard can use; persona metrics add their own in front. */
export function commonTips(s, formatINR, goalWord = 'a savings goal') {
  const tips = [];
  const emptiest = [...s.budgetsNeedingAttention].sort((a, b) => a.health.ratio - b.health.ratio)[0];
  if (emptiest) {
    tips.push({
      tone: emptiest.health.key === 'empty' ? 'danger' : 'warn',
      text: `Your ${emptiest.name} budget has ${formatINR(emptiest.left)} left. Add money to it or spend less on it for a few days.`
    });
  }
  if (s.notInBudget > 0) {
    tips.push({
      tone: 'info',
      text: `${formatINR(s.notInBudget)} isn't in any budget yet. Put it into a budget or ${goalWord} so every rupee has a job.`
    });
  }
  if (s.spentLastMonth > 0 && s.spentThisMonth > 0) {
    const diff = Math.round(((s.spentThisMonth - s.spentLastMonth) / s.spentLastMonth) * 100);
    if (diff < 0) tips.push({ tone: 'good', text: `You've spent ${Math.abs(diff)}% less than last month so far. Nice work.` });
    else if (diff > 0) tips.push({ tone: 'warn', text: `You've already spent ${diff}% more than all of last month.` });
  }
  if (s.categoryBreakdown.length > 0) {
    const top = s.categoryBreakdown[0];
    tips.push({ tone: 'info', text: `Most of your spending this month went to ${top.category} (${top.percent}%).` });
  }
  return tips;
}
