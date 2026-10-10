import React, { useState } from 'react';
import { getPersonaConfig } from '../../data/personas';
import { formatINR } from '../../lib/format';
import ProgressBar from '../../components/ui/ProgressBar';
import {
  Greeting,
  HeroCard,
  SetupCard,
  MetricsRow,
  AttentionNotice,
  BudgetsCard,
  Last7DaysCard,
  TipsCard,
  RecentActivityCard
} from '../shared/HomeSections';

export default function StudentHome({ user, summary: s, transactions, actions }) {
  const [masked, setMasked] = useState(false);
  const persona = getPersonaConfig(user?.account_type);
  if (!s) return null;

  const hide = (v) => (masked ? '••••••' : formatINR(v));
  const todayPct = s.safeToSpendToday > 0 ? (s.spentToday / s.safeToSpendToday) * 100 : s.spentToday > 0 ? 100 : 0;
  const overToday = s.spentToday > s.safeToSpendToday && s.safeToSpendToday > 0;

  return (
    <div className="x-page">
      <Greeting user={user} subtitle={persona.copy.homeSubtitle} />

      <section className="x-hero-row">
        <HeroCard
          label="Money you have"
          amount={s.moneyYouHave}
          note="Everything you've added, minus what you've spent and saved."
          masked={masked}
          onToggleMask={() => setMasked((m) => !m)}
          stats={[
            { label: 'In your budgets', value: s.inBudgets, onClick: () => actions.navigate('wallets') },
            { label: 'Not in a budget yet', value: s.notInBudget, onClick: () => actions.navigate('wallets') },
            { label: 'Saved in goals', value: s.savedInGoals, onClick: () => actions.navigate('goals') }
          ]}
        />

        <div className="x-card x-safe">
          <span className="x-overline">You can spend today</span>
          <div className="x-safe-amount">{hide(s.safeToSpendToday)}</div>
          <ProgressBar
            value={todayPct}
            tone={overToday ? 'danger' : todayPct >= 80 ? 'warn' : 'brand'}
            label="Spent today compared with your safe amount"
          />
          <div className="x-safe-meta">
            <span>Spent today {hide(s.spentToday)}</span>
            <span className={overToday ? 'x-text-danger' : ''}>
              {overToday ? `${hide(s.spentToday - s.safeToSpendToday)} over` : `${hide(s.leftToday)} left`}
            </span>
          </div>
          <p className="x-help">
            {s.moneyYouHave > 0
              ? `Spend up to this much each day and your money lasts the ${s.daysLeft} ${s.daysLeft === 1 ? 'day' : 'days'} left this month.`
              : 'Add the money you received this month and Xpense will work out how much you can spend each day.'}
          </p>
        </div>
      </section>

      {!s.setupComplete && <SetupCard steps={s.setupSteps} onAction={actions.runStep} />}

      <MetricsRow
        items={[
          {
            label: 'Spent this month',
            value: formatINR(s.spentThisMonth),
            note: s.spentLastMonth > 0 ? `Last month: ${formatINR(s.spentLastMonth)}` : 'Your total spending so far'
          },
          {
            label: 'Money in this month',
            value: formatINR(s.moneyInThisMonth),
            tone: 'brand',
            note: `${persona.copy.moneyInLabel}, gifts and other money received`
          },
          { label: 'Daily average', value: formatINR(s.weekAverage), note: 'What you spend on a typical day (last 7 days)' },
          {
            label: 'Savings goals',
            value: String(s.activeGoals.length),
            note: s.activeGoals.length > 0 ? `${formatINR(s.savedInGoals)} saved so far` : 'No goals yet'
          }
        ]}
      />

      <AttentionNotice budgets={s.budgetsNeedingAttention} />

      <div className="x-grid-main">
        <BudgetsCard budgets={s.budgets} onNavigate={actions.navigate} onAddMoneyToBudget={actions.addMoneyToBudget} />
        <div className="x-stack">
          <Last7DaysCard days={s.last7Days} lineValue={s.safeToSpendToday} />
          <TipsCard tips={s.tips} onNavigate={actions.navigate} />
        </div>
      </div>

      <RecentActivityCard transactions={transactions} onNavigate={actions.navigate} onAddMoneyIn={actions.addMoneyIn} />
    </div>
  );
}
