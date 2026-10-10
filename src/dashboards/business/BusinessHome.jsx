import React, { useState } from 'react';
import { ArrowRight, Store, Loader2 } from 'lucide-react';
import { getPersonaConfig } from '../../data/personas';
import { formatINR } from '../../lib/format';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
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
import MonthlyChart from './MonthlyChart';

function TaxCard({ s, onMoveToTax, onNavigate }) {
  const [busy, setBusy] = useState(false);
  const pct = s.taxNeeded > 0 ? (s.taxSetAside / s.taxNeeded) * 100 : s.taxSetAside > 0 ? 100 : 0;

  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Tax set aside</h2>
          <p className="x-card-sub">
            {s.taxPercent > 0 ? `${s.taxPercent}% of this month's money in` : 'Tax rate not set yet'}
          </p>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate('settings')}>
          {s.taxPercent > 0 ? 'Change rate' : 'Set rate'} <ArrowRight size={14} />
        </button>
      </div>
      {!s.taxWallet ? (
        <p className="x-help">Mark one of your budgets as the tax budget on the Budgets page to track it here.</p>
      ) : (
        <>
          <div className="x-row-between">
            <span className="x-display-sm">{formatINR(s.taxSetAside)}</span>
            <span className="x-muted x-small">of {formatINR(s.taxNeeded)} needed</span>
          </div>
          <div className="x-tax-bar">
            <ProgressBar value={pct} tone={s.taxGap > 0 ? 'warn' : 'brand'} label="Tax set aside compared with tax needed" />
          </div>
          {s.taxGap > 0 ? (
            <div className="x-tax-action">
              <p className="x-help">
                {formatINR(s.taxGap)} short.{' '}
                {s.taxCanMove > 0
                  ? `You can move ${formatINR(s.taxCanMove)} from money not in a budget.`
                  : 'Add money in first, then move it here.'}
              </p>
              {s.taxCanMove > 0 && (
                <button
                  type="button"
                  className="x-btn x-btn-secondary x-btn-sm"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onMoveToTax(s.taxWallet, s.taxCanMove);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy && <Loader2 size={14} className="x-spin" />}
                  Move {formatINR(s.taxCanMove)}
                </button>
              )}
            </div>
          ) : (
            <p className="x-help">{s.taxNeeded > 0 ? "You're covered for this month." : 'Nothing needed yet this month.'}</p>
          )}
        </>
      )}
    </section>
  );
}

function PayeesCard({ payees, onNavigate }) {
  return (
    <section className="x-card">
      <div className="x-card-head">
        <div>
          <h2 className="x-h2">Biggest payees</h2>
          <p className="x-card-sub">Who you paid the most this month</p>
        </div>
        <button type="button" className="x-link" onClick={() => onNavigate('payees')}>
          All payees <ArrowRight size={14} />
        </button>
      </div>
      {payees.length === 0 ? (
        <EmptyState icon={Store} title="No payments this month" text="When you record payments, the people and companies you pay show up here." />
      ) : (
        <ul className="x-breakdown">
          {payees.map((p, i) => (
            <li key={p.name}>
              <div className="x-row-between">
                <span className="x-row-title">{p.name}</span>
                <span>
                  <strong className="x-strong">{formatINR(p.amount)}</strong>
                  <span className="x-muted x-small"> · {p.percent}%</span>
                </span>
              </div>
              <div className="x-hbar">
                <div className={`x-hbar-fill x-bg-c${(i % 6) + 1}`} style={{ width: `${Math.max(2, p.percent)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function BusinessHome({ user, summary: s, transactions, extras = {}, actions }) {
  const [masked, setMasked] = useState(false);
  const persona = getPersonaConfig(user?.account_type);
  if (!s) return null;

  const hide = (v) => (masked ? '••••••' : formatINR(v));
  const profitTone = s.profitThisMonth > 0 ? 'brand' : s.profitThisMonth < 0 ? 'danger' : undefined;
  const subtitle = user?.business_name ? `Here's how ${user.business_name} is doing this month.` : persona.copy.homeSubtitle;

  return (
    <div className="x-page">
      <Greeting user={user} subtitle={subtitle} />

      <section className="x-hero-row">
        <HeroCard
          label="Cash available"
          amount={s.moneyYouHave}
          note="All money in, minus everything paid out and kept in reserves."
          masked={masked}
          onToggleMask={() => setMasked((m) => !m)}
          stats={[
            { label: 'In budgets', value: s.inBudgets, onClick: () => actions.navigate('wallets') },
            { label: 'Not in a budget yet', value: s.notInBudget, onClick: () => actions.navigate('wallets') },
            { label: 'In reserves', value: s.savedInGoals, onClick: () => actions.navigate('goals') }
          ]}
        />

        <div className="x-card x-safe">
          <span className="x-overline">Months of cash left</span>
          <div className={`x-safe-amount ${s.cashTone !== 'brand' ? `x-text-${s.cashTone}` : ''}`}>
            {masked ? '••••' : s.monthsOfCashLeftText || '—'}
          </div>
          <p className="x-help">
            {s.monthsOfCashLeft === null
              ? 'Record your payments and Xpense will work out how long your cash lasts.'
              : `At your usual spending of ${hide(s.avgMonthlySpending)} a month.`}
          </p>
          {s.monthsOfCashLeft !== null && s.monthsOfCashLeft < 6 && (
            <p className={`x-small x-text-${s.cashTone}`}>
              {s.monthsOfCashLeft < 3 ? 'Under 3 months — act soon.' : 'Under 6 months — keep an eye on costs.'}
            </p>
          )}
        </div>
      </section>

      {!s.setupComplete && <SetupCard steps={s.setupSteps} onAction={actions.runStep} />}

      <MetricsRow
        items={[
          { label: 'Money in this month', value: formatINR(s.moneyInThisMonth), tone: 'brand', note: 'Client payments and other income' },
          {
            label: 'Money out this month',
            value: formatINR(s.spentThisMonth),
            note: s.spentLastMonth > 0 ? `Last month: ${formatINR(s.spentLastMonth)}` : 'Everything paid out'
          },
          {
            label: 'Profit this month',
            value: formatINR(s.profitThisMonth, { sign: true }),
            tone: profitTone,
            note: 'Money in minus money out'
          },
          { label: 'Usual monthly spending', value: formatINR(Math.round(s.avgMonthlySpending)), note: 'Average of recent months' }
        ]}
      />

      <AttentionNotice budgets={s.budgetsNeedingAttention} />

      <div className="x-grid-main">
        <section className="x-card">
          <div className="x-card-head">
            <div>
              <h2 className="x-h2">Money in vs money out</h2>
              <p className="x-card-sub">The last 6 months</p>
            </div>
            <button type="button" className="x-link" onClick={() => actions.navigate('analytics')}>
              Reports <ArrowRight size={14} />
            </button>
          </div>
          <MonthlyChart months={s.monthly} />
        </section>
        <div className="x-stack">
          <TaxCard s={s} onMoveToTax={actions.moveToTax} onNavigate={actions.navigate} />
          <TipsCard tips={s.tips} onNavigate={actions.navigate} linkLabel="Reports" />
        </div>
      </div>

      <div className="x-grid-main">
        <BudgetsCard
          budgets={s.budgets}
          subtitle="What's left in each budget this month"
          onNavigate={actions.navigate}
          onAddMoneyToBudget={actions.addMoneyToBudget}
        />
        <PayeesCard payees={extras.payees || []} onNavigate={actions.navigate} />
      </div>

      <RecentActivityCard transactions={transactions} onNavigate={actions.navigate} onAddMoneyIn={actions.addMoneyIn} />
    </div>
  );
}
