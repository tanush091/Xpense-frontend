import { apiClient } from './apiClient';

export const analyticsService = {
  /**
   * Fetches server-computed analytics from the Spring Boot backend
   */
  async getAnalyticsSummary() {
    try {
      const data = await apiClient.get('/analytics');
      if (data) return data;
    } catch (err) {
      console.warn('Backend /api/analytics unreachable, using client computation:', err.message);
    }
    return null;
  },

  /**
   * Fetches budget and wallet alerts from the backend
   */
  async getAlerts() {
    try {
      const data = await apiClient.get('/analytics/alerts');
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn('Backend /api/analytics/alerts unreachable:', err.message);
    }
    return [];
  },

  /**
   * Computes comprehensive analytics from a list of transactions and wallets
   */
  calculateAnalytics(transactions = [], wallets = []) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // 1. Spending Breakdown by Category
    const categoryMap = {};
    expenses.forEach(t => {
      const cat = t.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(t.amount || 0);
    });

    const breakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    // 2. Real Monthly Trends
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthSpend = expenses
      .filter(t => {
        const d = t.timestamp || t.date ? new Date(t.timestamp || t.date) : new Date();
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const lastMonthSpend = expenses
      .filter(t => {
        const d = t.timestamp || t.date ? new Date(t.timestamp || t.date) : new Date();
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const changePercent = lastMonthSpend > 0
      ? Math.round(((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100)
      : 0;

    // 3. Daily Patterns
    const daySpending = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    expenses.forEach(t => {
      const d = t.timestamp || t.date ? new Date(t.timestamp || t.date) : new Date();
      const dayName = dayNames[d.getDay()];
      daySpending[dayName] = (daySpending[dayName] || 0) + parseFloat(t.amount || 0);
    });

    let peakDay = 'Monday';
    let maxSpend = 0;
    let bestDay = 'Sunday';
    let minSpend = Infinity;

    Object.entries(daySpending).forEach(([day, amt]) => {
      if (amt > maxSpend) {
        maxSpend = amt;
        peakDay = day;
      }
      if (amt < minSpend) {
        minSpend = amt;
        bestDay = day;
      }
    });

    const avgDailySpend = Math.round(thisMonthSpend / Math.max(1, now.getDate()));

    // 4. Dynamic Real Insights
    const insights = [];

    if (totalExpense === 0) {
      insights.push({
        type: 'info',
        title: 'Fresh Financial Runway ✨',
        message: 'No expenses recorded this month yet. Your spending envelopes are fully intact.'
      });
    } else if (changePercent < 0) {
      insights.push({
        type: 'success',
        title: 'Spending Velocity Down 🎉',
        message: `You're tracking ${Math.abs(changePercent)}% lower expenditure than last month.`
      });
    } else if (changePercent > 0) {
      insights.push({
        type: 'warning',
        title: 'Outflow Surge Alert ⚠️',
        message: `Spending is tracking ${changePercent}% higher than previous month.`
      });
    } else {
      insights.push({
        type: 'neutral',
        title: 'Stable Cash Flow 📊',
        message: 'Spending is well aligned with your monthly budget envelope.'
      });
    }

    // Check low wallets
    const lowWallet = wallets.find(w => w.status === 'Low' || (parseFloat(w.budget_limit || 0) > 0 && parseFloat(w.balance || 0) < (parseFloat(w.budget_limit) * 0.25)));
    if (lowWallet) {
      insights.push({
        type: 'warning',
        title: 'Envelope Headroom Alert 💡',
        message: `Your ${lowWallet.name} envelope balance is low (₹${lowWallet.balance}). Consider topping up.`
      });
    } else if (wallets.length > 0) {
      insights.push({
        type: 'info',
        title: 'Envelopes Healthy ✨',
        message: 'Category allocations have comfortable headroom for daily expenses.'
      });
    }

    return {
      totalExpense,
      totalIncome,
      breakdown,
      monthlyTrends: {
        thisMonth: thisMonthSpend,
        lastMonth: lastMonthSpend,
        change: lastMonthSpend > 0 ? (changePercent < 0 ? `${changePercent}%` : `+${changePercent}%`) : '0%'
      },
      dailyPatterns: {
        peakDay: totalExpense > 0 ? peakDay : 'No Outflows',
        avgDailySpend: avgDailySpend,
        bestDay: totalExpense > 0 ? bestDay : 'N/A'
      },
      insights
    };
  }
};
