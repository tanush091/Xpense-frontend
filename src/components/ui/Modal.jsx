import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Centered dialog on desktop, bottom sheet on phones (DESIGN §6). Esc and scrim close it. */
export default function Modal({ open, title, description, onClose, children, footer, width = 480 }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const first = panelRef.current?.querySelector('input, select, textarea, button:not(.x-modal-close)');
    first?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="x-scrim" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="x-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="x-modal-head">
          <div>
            <h2 className="x-modal-title">{title}</h2>
            {description && <p className="x-modal-desc">{description}</p>}
          </div>
          <button type="button" className="x-icon-btn x-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="x-modal-body">{children}</div>
        {footer && <div className="x-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
