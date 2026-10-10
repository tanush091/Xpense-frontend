import React, { useMemo, useState } from 'react';
import { Search, Download, ArrowLeftRight, Trash2, Loader2 } from 'lucide-react';
import { reportService } from '../services/reportService';
import { formatINR, formatDayLabel, formatTime, formatLongDate, txDate } from '../lib/format';
import PageHeader from './ui/PageHeader';
import Modal from './ui/Modal';
import CategoryIcon from './ui/CategoryIcon';
import EmptyState from './ui/EmptyState';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Money out' },
  { id: 'income', label: 'Money in' }
];

export default function TransactionsView({ title = 'Activity', transactions = [], onDeleteTransaction, onAddExpense, notify }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.category).filter(Boolean))),
    [transactions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return [t.title, t.category, t.merchant, t.recipient, t.wallet_name].some((v) => v?.toLowerCase().includes(q));
    });
  }, [transactions, query, type, category]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const label = formatDayLabel(txDate(t));
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(t);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totals = useMemo(() => {
    let out = 0;
    let inn = 0;
    filtered.forEach((t) => {
      if (t.type === 'income') inn += Number(t.amount) || 0;
      else out += Number(t.amount) || 0;
    });
    return { out, inn };
  }, [filtered]);

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

  const closeDetail = () => {
    setSelected(null);
    setConfirming(false);
  };

  return (
    <div className="x-page">
      <PageHeader
        title={title}
        subtitle="Every rupee in and out, newest first. Tap an item to see details."
        actions={
          <button type="button" className="x-btn x-btn-secondary" onClick={download} disabled={exporting}>
            {exporting ? <Loader2 size={16} className="x-spin" /> : <Download size={16} />}
            Download statement
          </button>
        }
      />

      <div className="x-toolbar">
        <div className="x-segmented" role="tablist" aria-label="Filter by direction">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={type === f.id}
              className={`x-seg ${type === f.id ? 'is-active' : ''}`}
              onClick={() => setType(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="x-toolbar-right">
          {categories.length > 0 && (
            <select className="x-input x-input-sm" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <div className="x-search">
            <Search size={16} />
            <input
              type="search"
              className="x-input x-input-sm"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search activity"
            />
          </div>
        </div>
      </div>

      <div className="x-card x-card-flush">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={transactions.length === 0 ? 'No activity yet' : 'Nothing matches'}
            text={
              transactions.length === 0
                ? 'When you add money in or record an expense, it shows up here.'
                : 'Try a different search or filter.'
            }
            action={
              transactions.length === 0 && (
                <button type="button" className="x-btn x-btn-secondary" onClick={onAddExpense}>
                  Add an expense
                </button>
              )
            }
          />
        ) : (
          groups.map(([label, items]) => (
            <div key={label} className="x-day-group">
              <div className="x-day-label">{label}</div>
              <ul className="x-list">
                {items.map((tx) => {
                  const income = tx.type === 'income';
                  const d = txDate(tx);
                  return (
                    <li key={tx.id}>
                      <button type="button" className="x-tx-row x-tx-button" onClick={() => setSelected(tx)}>
                        <CategoryIcon category={tx.category} name={tx.title} income={income} size={38} />
                        <span className="x-tx-main">
                          <span className="x-row-title">{tx.title}</span>
                          <span className="x-small x-muted">
                            {income ? 'Money in' : tx.wallet_name || tx.category} · {formatTime(d)}
                          </span>
                        </span>
                        <span className={`x-amount-cell ${income ? 'x-text-brand' : ''}`}>
                          {income ? '+' : '−'}
                          {formatINR(tx.amount)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="x-small x-muted x-center">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} · {formatINR(totals.inn)} in · {formatINR(totals.out)} out
        </p>
      )}

      <Modal open={Boolean(selected)} onClose={closeDetail} title={selected?.title || ''}>
        {selected && (
          <>
            <div className="x-detail-amount">
              <span className={selected.type === 'income' ? 'x-text-brand' : ''}>
                {selected.type === 'income' ? '+' : '−'}
                {formatINR(selected.amount)}
              </span>
            </div>
            <dl className="x-detail">
              <div><dt>Type</dt><dd>{selected.type === 'income' ? 'Money in' : 'Money out'}</dd></div>
              {selected.type !== 'income' && <div><dt>Budget</dt><dd>{selected.wallet_name || '—'}</dd></div>}
              <div><dt>Category</dt><dd>{selected.category || '—'}</dd></div>
              <div><dt>Paid with</dt><dd>{selected.payment_method || '—'}</dd></div>
              {(selected.merchant || selected.recipient) && (
                <div><dt>{selected.merchant ? 'Paid to' : 'Sent to'}</dt><dd>{selected.merchant || selected.recipient}</dd></div>
              )}
              <div><dt>Date</dt><dd>{formatLongDate(txDate(selected))}, {formatTime(txDate(selected))}</dd></div>
              {selected.note && <div><dt>Note</dt><dd>{selected.note}</dd></div>}
            </dl>

            {confirming ? (
              <div className="x-confirm">
                <p>
                  Delete this {selected.type === 'income' ? 'money in' : 'expense'}?{' '}
                  {selected.type === 'income'
                    ? selected.wallet_id
                      ? `${formatINR(selected.amount)} will be taken back out of ${selected.wallet_name || 'that budget'}.`
                      : `${formatINR(selected.amount)} will be taken off your balance.`
                    : `${formatINR(selected.amount)} goes back into ${selected.wallet_name || 'your balance'}.`}
                </p>
                <div className="x-form-actions">
                  <button type="button" className="x-btn x-btn-ghost" onClick={() => setConfirming(false)}>Keep it</button>
                  <button
                    type="button"
                    className="x-btn x-btn-danger"
                    onClick={async () => {
                      await onDeleteTransaction(selected.id);
                      closeDetail();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="x-form-actions">
                <button type="button" className="x-btn x-btn-danger" onClick={() => setConfirming(true)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
