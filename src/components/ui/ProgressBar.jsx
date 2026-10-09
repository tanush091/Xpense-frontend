import React from 'react';

/** 6px bar. tone: brand | warn | danger. value is 0–100. */
export default function ProgressBar({ value = 0, tone = 'brand', label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="x-progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`x-progress-fill x-tone-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
