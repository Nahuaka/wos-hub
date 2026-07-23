import { useState } from 'react';
import HeroCard from './HeroCard';

export default function HeroSection({ title, heroes, heroStates, rallyLeadOn, onToggleOwned, onWidgetChange }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`collapsible${collapsed ? ' collapsed' : ''}`}>
      <div className="section-title-row collapsible-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="section-title">{title}</div>
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
      <div className="card collapsible-body">
        <div className="hero2-grid">
          {heroes.map((hero) => (
            <HeroCard
              key={hero.slug}
              hero={hero}
              state={heroStates[hero.slug] || { owned: false, widget: 0 }}
              rallyLeadOn={rallyLeadOn}
              onToggleOwned={onToggleOwned}
              onWidgetChange={onWidgetChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
