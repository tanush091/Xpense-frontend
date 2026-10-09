import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="x-page-head">
      <div>
        <h1 className="x-h1">{title}</h1>
        {subtitle && <p className="x-page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="x-page-actions">{actions}</div>}
    </div>
  );
}
