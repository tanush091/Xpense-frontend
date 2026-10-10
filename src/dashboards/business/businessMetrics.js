// Business dashboard: cash, monthly spending, profit and tax set aside.
import { formatINR, toNumber } from '../../lib/format';
import { computeBaseSummary, commonTips, averageMonthlySpending } from '../shared/baseMetrics';

/**
 * Average monthly spending from the server's month totals (previous full months with spending,
 * up to 3). Falls back to the transactions list when month totals aren't loaded.
 */
export function averageFromMonthly(monthly, transactions, now) {
  if (Array.isArray(monthly) && monthly.length > 1) {
    const previous = monthly
      .slice(0, -1)
      .map((m) => toNumber(m.money_out))
      .filter((v) => v > 0)
      .slice(-3);
    if (previous.length > 0) return previous.reduce((a, b) => a + b, 0) / previous.length;
    return toNumber(monthly[monthly.length - 1]?.money_out);
  }
  return averageMonthlySpending(transactions, now, 3);
}

/** "7.5 months", "More than 24 months" or null when there is no spending yet. */
export function describeMonthsLeft(months) {
  if (months === null || !Number.isFinite(months)) return null;
  if (months > 24) return 'More than 24 months';
  return `${months.toFixed(1)} ${months.toFixed(1) === '1.0' ? 'month' : 'months'}`;
}

export function computeBusinessSummary(input) {
  const { user, wallets = [], transactions = [], monthly = [], now = new Date() } = input;
  const s = computeBaseSummary(input);

  const avgMonthlySpending = averageFromMonthly(monthly, transactions, now);
  const monthsOfCashLeft = avgMonthlySpending > 0 ? s.moneyYouHave / avgMonthlySpending : null;
  const cashTone = monthsOfCashLeft === null ? 'brand' : monthsOfCashLeft < 3 ? 'danger' : monthsOfCashLeft < 6 ? 'warn' : 'brand';

  const profitThisMonth = s.moneyInThisMonth - s.spentThisMonth;

  const taxPercent = toNumber(user?.tax_reserve_percent);
  const taxNeeded = Math.round((taxPercent / 100) * s.moneyInThisMonth);
  const taxWallet = wallets.find((w) => w.is_tax_reserve === true) || null;
  const taxSetAside = taxWallet ? toNumber(taxWallet.balance) : 0;
  const taxGap = Math.max(0, taxNeeded - taxSetAside);
  const taxCanMove = Math.min(taxGap, s.notInBudget);

  const setupSteps = [
    {
      id: 'money-in',
      title: 'Record money coming in',
      description: 'Client payments, retainers and other income.',
      action: 'moneyIn',
      actionLabel: 'Add money in',
      done: s.hasMoneyIn || s.moneyYouHave > 0
    },
    {
      id: 'tax',
      title: 'Set your tax rate',
      description: 'Tell Xpense what share of money in to keep aside for tax.',
      action: 'settings',
      actionLabel: 'Set tax rate',
      done: taxPercent > 0
    },
    {
      id: 'budgets',
      title: 'Fund your budgets',
      description: 'Give cloud, software, travel and tax their own money.',
      action: 'budgets',
      actionLabel: 'Fill a budget',
      done: s.inBudgets > 0
    },
    {
      id: 'expense',
      title: 'Record every payment',
      description: 'Each payment comes out of a budget, so you see who you pay.',
      action: 'expense',
      actionLabel: 'Add an expense',
      done: s.hasMoneyOut
    }
  ];

  const summary = {
    ...s,
    monthly,
    avgMonthlySpending,
    monthsOfCashLeft,
    monthsOfCashLeftText: describeMonthsLeft(monthsOfCashLeft),
    cashTone,
    profitThisMonth,
    taxPercent,
    taxNeeded,
    taxWallet,
    taxSetAside,
    taxGap,
    taxCanMove,
    setupSteps,
    setupComplete: setupSteps.every((x) => x.done)
  };
  summary.tips = buildBusinessTips(summary);
  return summary;
}

export function buildBusinessTips(s) {
  const tips = [];
  if (s.monthsOfCashLeft !== null && s.monthsOfCashLeft < 3) {
    tips.push({
      tone: 'danger',
      text: `At your usual spending you have about ${s.monthsOfCashLeftText} of cash left. Cut costs or bring in more money.`
    });
  }
  if (s.taxGap > 0) {
    tips.push({
      tone: 'warn',
      text: `Move ${formatINR(s.taxGap)} into ${s.taxWallet?.name || 'your tax budget'} to cover tax on this month's money in.`
    });
  }
  if (s.moneyInThisMonth > 0 || s.spentThisMonth > 0) {
    if (s.profitThisMonth < 0) {
      tips.push({ tone: 'warn', text: `You spent ${formatINR(-s.profitThisMonth)} more than came in this month.` });
    } else if (s.profitThisMonth > 0) {
      tips.push({ tone: 'good', text: `You're ${formatINR(s.profitThisMonth)} ahead this month after costs.` });
    }
  }
  if (s.taxPercent === 0) {
    tips.push({ tone: 'info', text: 'Set your tax rate in Settings so Xpense can tell you how much to keep aside.' });
  }
  const all = [...tips, ...commonTips(s, formatINR, 'a reserve')];
  if (all.length === 0) {
    all.push({ tone: 'info', text: 'Record the money coming in, then fund your budgets. Xpense will track your cash and costs.' });
  }
  return all.slice(0, 3);
}
