import React from 'react';
import { formatINR } from '../../lib/format';

/** Currency input with a fixed ₹ prefix and optional quick-pick chips. */
export default function AmountField({ id, label, value, onChange, quick = [], helper, error, autoFocus, max }) {
  const helpId = helper || error ? `${id}-help` : undefined;
  return (
    <div className="x-field">
      <label className="x-label" htmlFor={id}>{label}</label>
      <div className={`x-amount ${error ? 'has-error' : ''}`}>
        <span className="x-amount-prefix">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="1"
          step="any"
          max={max}
          placeholder="0"
          value={value}
          autoFocus={autoFocus}
          aria-describedby={helpId}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {quick.length > 0 && (
        <div className="x-chips">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              className={`x-chip ${String(value) === String(q) ? 'is-active' : ''}`}
              onClick={() => onChange(String(q))}
            >
              {formatINR(q)}
            </button>
          ))}
        </div>
      )}
      {(error || helper) && (
        <p id={helpId} className={error ? 'x-error' : 'x-help'}>{error || helper}</p>
      )}
    </div>
  );
}
