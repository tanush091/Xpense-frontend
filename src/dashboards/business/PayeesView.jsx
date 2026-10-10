import React, { useEffect, useMemo, useState } from 'react';
import { Store, Loader2 } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { formatINR } from '../../lib/format';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

function monthOptions(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    return {
      value: iso(d).slice(0, 7),
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      from: iso(d),
      to: iso(i === 0 ? now : last)
    };
  });
}

/** Everyone the business paid in a chosen month, biggest first. */
export default function PayeesView({ notify }) {
  const options = useMemo(() => monthOptions(6), []);
  const [month, setMonth] = useState(options[0].value);
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const opt = options.find((o) => o.value === month);
    let alive = true;
    setLoading(true);
    analyticsService
      .getTopPayees({ from: opt.from, to: opt.to, limit: 50 })
      .then((rows) => alive && setPayees(rows))
      .catch((err) => alive && notify?.(`Couldn't load payees: ${err.message}`, 'error'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [month, options, notify]);

  const total = payees.reduce((t, p) => t + Number(p.amount || 0), 0);

  return (
    <div className="x-page">
      <PageHeader
        title="Payees"
        subtitle="The people and companies you paid, biggest first. Use it to spot costs you can cut."
        actions={
          <select className="x-input x-input-sm" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Choose a month">
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        }
      />

      <section className="x-summary-strip">
        <div className="x-summary-item">
          <span className="x-overline">Paid out</span>
          <span className="x-summary-value">{formatINR(total)}</span>
          <span className="x-small x-muted">In {options.find((o) => o.value === month)?.label}</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Payees</span>
          <span className="x-summary-value">{payees.length}</span>
          <span className="x-small x-muted">Different people and companies</span>
        </div>
        <div className="x-summary-item">
          <span className="x-overline">Biggest payee</span>
          <span className="x-summary-value x-metric-text">{payees[0]?.name || '—'}</span>
          <span className="x-small x-muted">{payees[0] ? `${payees[0].percent}% of everything paid out` : 'No payments yet'}</span>
        </div>
      </section>

      <section className="x-card">
        {loading ? (
          <div className="x-empty"><Loader2 size={20} className="x-spin" /></div>
        ) : payees.length === 0 ? (
          <EmptyState icon={Store} title="No payments in this month" text="Record payments with the shop or person's name and they'll show up here." />
        ) : (
          <ul className="x-breakdown">
            {payees.map((p, i) => (
              <li key={p.name}>
                <div className="x-row-between">
                  <span className="x-row-title">{p.name}</span>
                  <span>
                    <strong className="x-strong">{formatINR(p.amount)}</strong>
                    <span className="x-muted x-small"> · {p.percent}% · {p.payments} {p.payments === 1 ? 'payment' : 'payments'}</span>
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
    </div>
  );
}
