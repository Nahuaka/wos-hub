import { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

const CHEVRON = (
  <svg className="multi-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Toolbar filter dropdown - lets the user check any number of `options`.
// An empty selection means "no filter" (matches everything), shown as
// `allLabel`. Each option may carry a `dotColor` (hex) or `dotClassName`
// (for the role-dot palette) to render a small color swatch.
export default function MultiSelectFilter({ allLabel, options, selected, onChange }) {
  const detailsRef = useRef(null);
  const [open, setOpen] = useState(false);

  useClickOutside(detailsRef, open, () => setOpen(false));

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
  }

  const summary =
    selected.length === 0
      ? allLabel
      : options
          .filter((o) => selected.includes(o.id))
          .map((o) => o.label)
          .join(', ');

  return (
    <details
      className="multi-select filter-multi-select"
      ref={detailsRef}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="multi-select-summary" title={summary}>
        <span className="multi-select-summary-text">{summary}</span>
        {CHEVRON}
      </summary>
      <div className="multi-select-menu">
        {options.map((opt) => (
          <label key={opt.id} className="multi-select-option">
            <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} />
            {opt.dotColor && <span className="p-alliance-dot" style={{ background: opt.dotColor }} />}
            {opt.dotClassName && <span className={`role-dot ${opt.dotClassName}`} />}
            {opt.label}
          </label>
        ))}
      </div>
    </details>
  );
}
