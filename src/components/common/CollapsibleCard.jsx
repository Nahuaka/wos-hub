import { useState } from 'react';

/**
 * A section with a clickable header (icon + title + optional extra actions)
 * that expands/collapses a card body below it.
 */
export default function CollapsibleCard({
  icon,
  iconColor = 'teal',
  title,
  accentColor = 'teal',
  defaultCollapsed = true,
  headerExtra = null,
  children,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`collapsible${collapsed ? ' collapsed' : ''}`}>
      <div className="section-title-row collapsible-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="section-title">
          {icon && <span className={`section-icon ${iconColor}`}>{icon}</span>}
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {headerExtra}
          <svg
            className="chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      <div className={`card card-accent card-accent-${accentColor} collapsible-body`}>{children}</div>
    </div>
  );
}
