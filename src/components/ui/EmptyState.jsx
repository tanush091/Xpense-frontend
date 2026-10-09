import React from 'react';

export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="x-empty">
      {Icon && (
        <div className="x-empty-icon">
          <Icon size={22} strokeWidth={1.5} />
        </div>
      )}
      <div className="x-empty-title">{title}</div>
      {text && <p className="x-empty-text">{text}</p>}
      {action}
    </div>
  );
}
