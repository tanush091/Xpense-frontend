// Personal dashboard: a salary, household bills and an emergency fund.
import { formatINR, formatLongDate, toNumber } from '../../lib/format';
import { computeBaseSummary, commonTips, averageMonthlySpending, sum } from '../shared/baseMetrics';

/** "2026-10-05" → local Date at midnight (no timezone shift). */
export function parseDay(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Plain status for one bill relative to today. */
export function billStatus(bill, now = new Date()) {
  const due = parseDay(bill.next_due_date);
  if (!due) return { key: 'none', label: 'No due date', days: null };
  const days = Math.round((due - startOfDay(now)) / MS_PER_DAY);
  if (days < 0) return { key: 'overdue', label: `Overdue by ${-days} ${days === -1 ? 'day' : 'days'}`, days };
  if (days === 0) return { key: 'today', label: 'Due today', days };
  if (days === 1) return { key: 'soon', label: 'Due tomorrow', days };
  if (days <= 7) return { key: 'soon', label: `Due in ${days} days`, days };
  return { key: 'later', label: `Due ${formatLongDate(due)}`, days };
}

export function computePersonalSummary(input) {
  const { bills = [], goals = [], transactions = [], now = new Date() } = input;
  const s = computeBaseSummary(input);

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const activeBills = bills
    .filter((b) => b.is_active !== false)
    .map((b) => ({ ...b, amount: toNumber(b.amount), status: billStatus(b, now), due: parseDay(b.next_due_date) }))
    .sort((a, b) => (a.due?.getTime() || 0) - (b.due?.getTime() || 0));

  // Bills due on or before the last day of this month (overdue ones included) are still to pay
  const dueThisMonth = activeBills.filter((b) => b.due && b.due <= endOfMonth);
  const billsStillToPay = sum(dueThisMonth, (b) => b.amount);
  const paidThisMonth = activeBills.filter((b) => {
    const paid = parseDay(b.last_paid_date);
    return paid && paid.getFullYear() === now.getFullYear() && paid.getMonth() === now.getMonth();
  });
  const billsPaid = sum(paidThisMonth, (b) => b.amount);
  const billsPaidPercent = billsPaid + billsStillToPay > 0 ? (billsPaid / (billsPaid + billsStillToPay)) * 100 : 0;

  const leftAfterBills = s.moneyYouHave - billsStillToPay;
  const safeToSpendToday = Math.max(0, Math.floor(Math.max(0, leftAfterBills) / Math.max(1, s.daysLeft)));
  const savingRate =
    s.moneyInThisMonth > 0 ? Math.max(0, Math.round(((s.moneyInThisMonth - s.spentThisMonth) / s.moneyInThisMonth) * 100)) : null;

  const avgMonthlySpending = averageMonthlySpending(transactions, now, 3);
  const emergencyGoal = goals.find((g) => g.is_emergency === true) || null;
  const emergencySaved = emergencyGoal ? toNumber(emergencyGoal.current_amount) : 0;
  const emergencyCoverMonths = emergencyGoal && avgMonthlySpending > 0 ? emergencySaved / avgMonthlySpending : null;

  const setupSteps = [
    {
      id: 'money-in',
      title: 'Add your salary',
      description: 'Record the salary or other money that came in this month.',
      action: 'moneyIn',
      actionLabel: 'Add money in',
      done: s.hasMoneyIn || s.moneyYouHave > 0
    },
    {
      id: 'bills',
      title: 'Add your bills',
      description: 'Rent, electricity, phone — so you know what has to be paid.',
      action: 'bills',
      actionLabel: 'Add a bill',
      done: activeBills.length > 0
    },
    {
      id: 'budgets',
      title: 'Split the rest into budgets',
      description: 'Groceries, health, shopping — decide how much each gets.',
      action: 'budgets',
      actionLabel: 'Fill a budget',
      done: s.inBudgets > 0
    },
    {
      id: 'emergency',
      title: 'Build an emergency fund',
      description: 'Save 3–6 months of spending for surprises.',
      action: 'goals',
      actionLabel: 'Start the fund',
      done: Boolean(emergencyGoal)
    }
  ];

  const summary = {
    ...s,
    bills: activeBills,
    upcomingBills: activeBills.slice(0, 5),
    overdueBills: activeBills.filter((b) => b.status.key === 'overdue'),
    billsStillToPay,
    billsPaid,
    billsPaidPercent,
    leftAfterBills,
    safeToSpendToday,
    savingRate,
    avgMonthlySpending,
    emergencyGoal,
    emergencySaved,
    emergencyCoverMonths,
    setupSteps,
    setupComplete: setupSteps.every((x) => x.done)
  };
  summary.tips = buildPersonalTips(summary);
  return summary;
}

export function buildPersonalTips(s) {
  const tips = [];
  const overdue = s.overdueBills[0];
  if (overdue) {
    tips.push({ tone: 'danger', text: `${overdue.name} (${formatINR(overdue.amount)}) is overdue. Pay it soon to avoid late fees.` });
  } else {
    const soon = s.bills.find((b) => b.status.key === 'today' || b.status.key === 'soon');
    if (soon) tips.push({ tone: 'warn', text: `${soon.name} (${formatINR(soon.amount)}) is ${soon.status.label.toLowerCase()}.` });
  }
  if (s.leftAfterBills < 0) {
    tips.push({
      tone: 'danger',
      text: `This month's bills are ${formatINR(-s.leftAfterBills)} more than the money you have. Add money in or move a bill's date.`
    });
  }
  if (s.savingRate !== null && s.savingRate >= 20) {
    tips.push({ tone: 'good', text: `You've kept ${s.savingRate}% of what came in this month. Keep it up.` });
  }
  if (!s.emergencyGoal) {
    tips.push({ tone: 'info', text: 'Start an emergency fund. A good target is 3–6 months of your usual spending.' });
  } else if (s.emergencyCoverMonths !== null && s.emergencyCoverMonths < 3) {
    tips.push({
      tone: 'info',
      text: `Your emergency fund covers ${s.emergencyCoverMonths.toFixed(1)} months of spending. Aim for at least 3.`
    });
  }
  const all = [...tips, ...commonTips(s, formatINR)];
  if (all.length === 0) {
    all.push({ tone: 'info', text: 'Add your salary and your monthly bills. Xpense will show what is left to spend.' });
  }
  return all.slice(0, 3);
}
