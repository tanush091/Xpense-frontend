import React from 'react';
import { formatINR, toNumber } from '../../lib/format';

/** Compact "₹42k" style label for chart axes and bar tops. */
function shortINR(n) {
  const v = Math.abs(n);
  if (v >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${Math.round(n / 1e3)}k`;
  return formatINR(n);
}

/**
 * Money in (green) vs money out (ink) per month, labelled directly.
 * A visually hidden table gives screen readers the same numbers.
 */
export default function MonthlyChart({ months = [] }) {
  const rows = months.map((m) => ({ label: m.label, month: m.month, in: toNumber(m.money_in), out: toNumber(m.money_out) }));
  const max = Math.max(1, ...rows.flatMap((r) => [r.in, r.out]));
  const empty = rows.every((r) => r.in === 0 && r.out === 0);

  return (
    <div>
      <div className="x-legend" aria-hidden="true">
        <span><i className="x-legend-swatch x-bg-c1" /> Money in</span>
        <span><i className="x-legend-swatch x-legend-ink" /> Money out</span>
      </div>
      <div className="x-mchart" aria-hidden="true">
        {empty && <div className="x-bars-empty">No money in or out in the last {rows.length} months</div>}
        {rows.map((r) => (
          <div key={r.month} className="x-mchart-col" title={`${r.label}: ${formatINR(r.in)} in, ${formatINR(r.out)} out`}>
            <div className="x-mchart-bars">
              <div className="x-mchart-bar x-bg-c1" style={{ height: `${(r.in / max) * 100}%` }}>
                {r.in > 0 && <span>{shortINR(r.in)}</span>}
              </div>
              <div className="x-mchart-bar x-legend-ink" style={{ height: `${(r.out / max) * 100}%` }}>
                {r.out > 0 && <span>{shortINR(r.out)}</span>}
              </div>
            </div>
            <span className="x-bar-label">{r.label}</span>
          </div>
        ))}
      </div>
      <table className="x-sr-only">
        <caption>Money in and money out by month</caption>
        <thead>
          <tr><th>Month</th><th>Money in</th><th>Money out</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}><td>{r.label}</td><td>{formatINR(r.in)}</td><td>{formatINR(r.out)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
