import React, { useState } from 'react';
import { Download, Loader2, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { reportService } from '../services/reportService';
import { formatINR } from '../lib/format';
import PageHeader from './ui/PageHeader';
import EmptyState from './ui/EmptyState';

const BAR_TONES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

export default function AnalyticsView({ title = 'Insights', summary, notify }) {
  const [exporting, setExporting] = useState(false);
  if (!summary) return null;
  const s = summary;
  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long' });

  const diff = s.spentLastMonth > 0 ? Math.round(((s.spentThisMonth - s.spentLastMonth) / s.spentLastMonth) * 100) : null;
  const projected = Math.round((s.spentThisMonth / Math.max(1, new Date().getDate())) *
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());

  const download = async () => {
    setExporting(true);
    try {
      await reportService.downloadCsvReport();
    } catch (err) {
      notify?.(`Couldn't download your statement: ${err.message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="x-page">
      <PageHeader
        title={title}
        subtitle={`Where your money went in ${monthName}, and how it compares with last month.`}
        actions={
          <button type="button" className="x-btn x-btn-secondary" onClick={download} disabled={exporting}>
            {exporting ? <Loader2 size={16} className="x-spin" /> : <Download size={16} />}
            Download statement
          </button>
        }
      />

      <section className="x-metrics x-metrics-3">
        <div className="x-metric">
          <span className="x-overline">Spent in {monthName}</span>
          <span className="x-metric-value">{formatINR(s.spentThisMonth)}</span>
          <span className="x-metric-note">
            {diff === null ? 'No spending recorded last month' : (
              <span className={`x-inline-icon ${diff > 0 ? 'x-text-warn' : 'x-text-brand'}`}>
                {diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(diff)}% {diff > 0 ? 'more' : 'less'} than last month ({formatINR(s.spentLastMonth)})
              </span>
            )}
          </span>
        </div>
        <div className="x-metric">
          <span className="x-overline">If you keep this pace</span>
          <span className="x-metric-value">{formatINR(projected)}</span>
          <span className="x-metric-note">Expected spending by the end of {monthName}</span>
        </div>
        <div className="x-metric">
          <span className="x-overline">Your busiest day</span>
          <span className="x-metric-value x-metric-text">{s.busiestDay || '—'}</span>
          <span className="x-metric-note">The day of the week you usually spend the most</span>
        </div>
      </section>

      <div className="x-grid-main">
        <section className="x-card">
          <div className="x-card-head">
            <div>
              <h2 className="x-h2">Where your money went</h2>
              <p className="x-card-sub">Spending by category this month</p>
            </div>
          </div>
          {s.categoryBreakdown.length === 0 ? (
            <EmptyState icon={BarChart3} title="No spending yet this month" text="Once you record expenses, you'll see a breakdown here." />
          ) : (
            <ul className="x-breakdown">
              {s.categoryBreakdown.map((row, i) => (
                <li key={row.category}>
                  <div className="x-row-between">
                    <span className="x-row-title">{row.category}</span>
                    <span>
                      <strong className="x-strong">{formatINR(row.amount)}</strong>
                      <span className="x-muted x-small"> · {row.percent}%</span>
                    </span>
                  </div>
                  <div className="x-hbar">
                    <div className={`x-hbar-fill x-bg-${BAR_TONES[i % BAR_TONES.length]}`} style={{ width: `${Math.max(2, row.percent)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="x-stack">
          <section className="x-card">
            <div className="x-card-head">
              <div>
                <h2 className="x-h2">This month vs last month</h2>
              </div>
            </div>
            <div className="x-compare">
              {[
                { label: 'Last month', value: s.spentLastMonth },
                { label: `${monthName} so far`, value: s.spentThisMonth }
              ].map((row) => {
                const max = Math.max(s.spentLastMonth, s.spentThisMonth, 1);
                return (
                  <div key={row.label} className="x-compare-row">
                    <span className="x-small x-muted">{row.label}</span>
                    <div className="x-hbar x-hbar-lg">
                      <div className="x-hbar-fill x-bg-c1" style={{ width: `${(row.value / max) * 100}%` }} />
                    </div>
                    <span className="x-strong">{formatINR(row.value)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="x-card">
            <div className="x-card-head">
              <div>
                <h2 className="x-h2">What this means</h2>
              </div>
            </div>
            <ul className="x-tips">
              {s.tips.map((tip, i) => (
                <li key={i} className={`x-tip x-tip-${tip.tone}`}>{tip.text}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
