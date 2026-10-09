// Formatting helpers shared by every dashboard. Money is INR only (ADR-007).

export function toNumber(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** ₹1,24,500 — paise shown only when non-zero (DESIGN §3). */
export function formatINR(value, { paise = 'auto', sign = false } = {}) {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const hasPaise = Math.round(abs * 100) % 100 !== 0;
  const digits = paise === 'always' || (paise === 'auto' && hasPaise) ? 2 : 0;
  const body = abs.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  const prefix = n < 0 ? '−' : sign && n > 0 ? '+' : '';
  return `${prefix}₹${body}`;
}

export function txDate(tx) {
  const raw = tx?.date || tx?.created_at || tx?.createdAt;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Today", "Yesterday", or "8 Oct". */
export function formatDayLabel(date, now = new Date()) {
  if (!date) return 'Earlier';
  if (isSameDay(date, now)) return 'Today';
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (isSameDay(date, y)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {})
  });
}

export function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function formatLongDate(dateLike) {
  if (!dateLike) return '';
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function greetingFor(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(user) {
  const name = (user?.full_name || user?.fullName || user?.name || '').trim();
  return name ? name.split(/\s+/)[0] : 'there';
}

/**
 * Budget health from ADR-008 (balance ÷ limit): ≥30% good, 10–29% low, <10% empty.
 * Labels are written for people, not accountants.
 */
export function getBudgetHealth(balance, limit) {
  const b = toNumber(balance);
  const l = toNumber(limit);
  const ratio = l > 0 ? b / l : b > 0 ? 1 : 0;
  if (ratio >= 0.3) return { key: 'good', label: 'On track', ratio };
  if (ratio >= 0.1) return { key: 'low', label: 'Running low', ratio };
  return { key: 'empty', label: 'Almost empty', ratio };
}
