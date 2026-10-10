// Pieces shared by the Personal Home screen and the Bills page.
import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { formatINR, toNumber } from '../../lib/format';
import Modal from '../../components/ui/Modal';

const STATUS_BADGE = { overdue: 'empty', today: 'low', soon: 'low', later: 'unfunded', none: 'unfunded' };

export function BillStatusBadge({ status }) {
  return <span className={`x-badge x-badge-${STATUS_BADGE[status.key] || 'unfunded'}`}>{status.label}</span>;
}

/** "Pay Rent?" — shows where the money comes from, before → after, and blocks if it isn't enough. */
export function PayBillDialog({ bill, wallets = [], notInBudget = 0, onClose, onPay }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setError(''), [bill]);

  const wallet = bill ? wallets.find((w) => w.id === bill.wallet_id) : null;
  const available = wallet ? toNumber(wallet.balance) : notInBudget;
  const amount = bill ? toNumber(bill.amount) : 0;
  const short = Boolean(bill) && amount > available;

  return (
    <Modal
      open={Boolean(bill)}
      onClose={onClose}
      title={`Pay ${bill?.name || 'bill'}?`}
      description={bill ? `${formatINR(amount)} will be recorded as paid today, and the next due date moves forward.` : ''}
      footer={
        <>
          <button type="button" className="x-btn x-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="x-btn x-btn-primary"
            disabled={busy || short}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                await onPay(bill);
                onClose();
              } catch (err) {
                setError(err.message || 'Could not pay this bill.');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy && <Loader2 size={16} className="x-spin" />}
            Mark as paid
          </button>
        </>
      }
    >
      {bill && (
        <>
          <div className="x-before-after">
            <div>
              <span className="x-small x-muted">{wallet ? wallet.name : 'Not in a budget'} now</span>
              <strong>{formatINR(available)}</strong>
            </div>
            <ArrowRight size={18} className="x-muted" />
            <div>
              <span className="x-small x-muted">After paying</span>
              <strong className={short ? 'x-text-danger' : ''}>{formatINR(available - amount)}</strong>
            </div>
          </div>
          {short && (
            <p className="x-error x-form-error">
              There isn't enough money here. Add money to it first, or change where this bill is paid from.
            </p>
          )}
          {error && <p className="x-error x-form-error" role="alert">{error}</p>}
        </>
      )}
    </Modal>
  );
}
