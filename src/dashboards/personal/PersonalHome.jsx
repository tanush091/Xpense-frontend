import React, { useState } from 'react';
import { ArrowRight, CalendarClock, Plus } from 'lucide-react';
import { BillStatusBadge, PayBillDialog } from './BillParts';
import { getPersonaConfig } from '../../data/personas';
import { formatINR } from '../../lib/format';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import CategoryIcon from '../../components/ui/CategoryIcon';
import {
  Greeting,
  HeroCard,
  SetupCard,
  MetricsRow,
  AttentionNotice,
  BudgetsCard,
  TipsCard,
  RecentActivityCard
} from '../shared/HomeSections';

function UpcomingBillsCard({ bills, wallets, notInBudget, onNavigate, onPayBill }) {
  const [confirming, setConfirming] = useState(null);
  const walletName = (id) => wallets.find((w) => w.id === id)?.name || 'Money not in a budget';

  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Upcoming bills</h2>
          <p className="x-card-sub">What has to be paid next</p>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate('bills')}>
          All bills <ArrowRight size={14} />
        </button>
      </div>
      {bills.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bills added"
          text="Add rent, electricity or your phone bill so you always know what's coming."
          action={
            <button type="button" className="x-btn x-btn-secondary" onClick={() => onNavigate('bills')}>
              <Plus size={16} /> Add a bill
            </button>
          }
        />
      ) : (
        <ul className="x-list">
          {bills.map((b) => (
            <li key={b.id} className="x-tx-row x-bill-row">
              <CategoryIcon category="bill" name={b.name} size={38} />
              <div className="x-tx-main">
                <span className="x-row-title">{b.name}</span>
                <span className="x-small x-muted">Paid from {walletName(b.wallet_id)}</span>
              </div>
              <div className="x-bill-side">
                <span className="x-amount-cell">{formatINR(b.amount)}</span>
                <BillStatusBadge status={b.status} />
              </div>
              <button type="button" className="x-btn x-btn-secondary x-btn-sm" onClick={() => setConfirming(b)}>
                Mark as paid
              </button>
            </li>
          ))}
        </ul>
      )}
      <PayBillDialog
        bill={confirming}
        wallets={wallets}
        notInBudget={notInBudget}
        onClose={() => setConfirming(null)}
        onPay={onPayBill}
      />
    </section>
  );
}

export default function PersonalHome({ user, summary: s, transactions, wallets, actions }) {
  const [masked, setMasked] = useState(false);
  const persona = getPersonaConfig(user?.account_type);
  if (!s) return null;

  const hide = (v) => (masked ? '••••••' : formatINR(v));
  const short = s.leftAfterBills < 0;

  return (
    <div className="x-page">
      <Greeting user={user} subtitle={persona.copy.homeSubtitle} />

      <section className="x-hero-row">
        <HeroCard
          label="Money you have"
          amount={s.moneyYouHave}
          note="Everything that came in, minus what you've spent and saved."
          masked={masked}
          onToggleMask={() => setMasked((m) => !m)}
          stats={[
            { label: 'In your budgets', value: s.inBudgets, onClick: () => actions.navigate('wallets') },
            { label: 'Not in a budget yet', value: s.notInBudget, onClick: () => actions.navigate('wallets') },
            { label: 'Saved in goals', value: s.savedInGoals, onClick: () => actions.navigate('goals') }
          ]}
        />

        <div className="x-card x-safe">
          <span className="x-overline">Left after bills</span>
          <div className={`x-safe-amount ${short ? 'x-text-danger' : ''}`}>
            {short ? `−${hide(-s.leftAfterBills)}` : hide(s.leftAfterBills)}
          </div>
          <ProgressBar value={s.billsPaidPercent} label="Bills paid this month" />
          <div className="x-safe-meta">
            <span>Bills paid {hide(s.billsPaid)}</span>
            <span>{hide(s.billsStillToPay)} still to pay</span>
          </div>
          <p className="x-help">
            {s.bills.length === 0
              ? 'Add your monthly bills and Xpense will show what is left after paying them.'
              : short
                ? "This month's bills are more than the money you have."
                : `Money you have minus the bills still due this month. About ${hide(s.safeToSpendToday)} a day for the rest of the month.`}
          </p>
        </div>
      </section>

      {!s.setupComplete && <SetupCard steps={s.setupSteps} onAction={actions.runStep} />}

      <MetricsRow
        items={[
          {
            label: 'Spent this month',
            value: formatINR(s.spentThisMonth),
            note: s.spentLastMonth > 0 ? `Last month: ${formatINR(s.spentLastMonth)}` : 'Including bills you paid'
          },
          {
            label: 'Money in this month',
            value: formatINR(s.moneyInThisMonth),
            tone: 'brand',
            note: 'Salary and any other money received'
          },
          {
            label: "You're saving",
            value: s.savingRate === null ? '—' : `${s.savingRate}%`,
            note: s.savingRate === null ? 'Add money in to see this' : 'Of what came in this month, not spent'
          },
          {
            label: 'Emergency fund',
            value:
              s.emergencyCoverMonths === null
                ? s.emergencyGoal
                  ? formatINR(s.emergencySaved)
                  : '—'
                : `${s.emergencyCoverMonths.toFixed(1)} months`,
            note: !s.emergencyGoal
              ? 'Not started yet'
              : s.emergencyCoverMonths === null
                ? 'Saved so far'
                : `of your usual spending (${formatINR(s.emergencySaved)} saved)`
          }
        ]}
      />

      <AttentionNotice budgets={s.budgetsNeedingAttention} />

      <div className="x-grid-main">
        <UpcomingBillsCard
          bills={s.upcomingBills}
          wallets={wallets}
          notInBudget={s.notInBudget}
          onNavigate={actions.navigate}
          onPayBill={actions.payBillOrThrow}
        />
        <div className="x-stack">
          <TipsCard tips={s.tips} onNavigate={actions.navigate} />
        </div>
      </div>

      <BudgetsCard
        budgets={s.budgets}
        subtitle="What's left for groceries, health and the rest of the month"
        onNavigate={actions.navigate}
        onAddMoneyToBudget={actions.addMoneyToBudget}
      />

      <RecentActivityCard transactions={transactions} onNavigate={actions.navigate} onAddMoneyIn={actions.addMoneyIn} />
    </div>
  );
}
