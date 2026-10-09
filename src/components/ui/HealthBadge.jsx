import React from 'react';

/** On track / Running low / Almost empty — colour plus a text label, never colour alone. */
export default function HealthBadge({ health }) {
  if (!health) return null;
  return <span className={`x-badge x-badge-${health.key}`}>{health.label}</span>;
}
