// Student dashboard: pocket money that has to last the whole month.
import { formatINR } from '../../lib/format';
import { computeBaseSummary, commonTips } from '../shared/baseMetrics';

export function computeStudentSummary(input) {
  const s = computeBaseSummary(input);

  // How much can be spent per day for the rest of the month without running out.
  // Uses the money you had at the start of today, so today's spending isn't counted twice.
  const safeToSpendToday = Math.max(0, Math.floor((s.moneyYouHave + s.spentToday) / Math.max(1, s.daysLeft)));
  const leftToday = Math.max(0, safeToSpendToday - s.spentToday);

  const setupSteps = [
    {
      id: 'money-in',
      title: 'Add your money',
      description: 'Record the pocket money or stipend you received this month.',
      action: 'moneyIn',
      actionLabel: 'Add money in',
      done: s.hasMoneyIn || s.moneyYouHave > 0
    },
    {
      id: 'budgets',
      title: 'Split it into budgets',
      description: 'Decide how much goes to food, travel, books and fun.',
      action: 'budgets',
      actionLabel: 'Fill a budget',
      done: s.inBudgets > 0
    },
    {
      id: 'expense',
      title: 'Record what you spend',
      description: 'Each expense comes out of one budget, so you always know what is left.',
      action: 'expense',
      actionLabel: 'Add an expense',
      done: s.hasMoneyOut
    },
    {
      id: 'goal',
      title: 'Start a savings goal',
      description: 'Put aside money for a trip, a laptop or an emergency.',
      action: 'goals',
      actionLabel: 'Create a goal',
      done: (input.goals || []).length > 0
    }
  ];

  const summary = { ...s, safeToSpendToday, leftToday, setupSteps, setupComplete: setupSteps.every((x) => x.done) };
  summary.tips = buildStudentTips(summary);
  return summary;
}

export function buildStudentTips(s) {
  const tips = [];
  if (s.spentToday > s.safeToSpendToday && s.safeToSpendToday > 0) {
    tips.push({
      tone: 'warn',
      text: `You've spent ${formatINR(s.spentToday)} today, more than your safe amount of ${formatINR(s.safeToSpendToday)}. Spending a little less tomorrow will balance it out.`
    });
  }
  const all = [...commonTips(s, formatINR).slice(0, 1), ...tips, ...commonTips(s, formatINR).slice(1)];
  if (all.length === 0) {
    all.push({
      tone: 'info',
      text: 'Start by adding the money you received this month. Xpense will then show how much you can safely spend each day.'
    });
  }
  return all.slice(0, 3);
}
