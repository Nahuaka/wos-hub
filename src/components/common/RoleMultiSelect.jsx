import { useRef, useState } from 'react';
import { ROLE_DEFS } from '../../data/roleDefs';
import { useClickOutside } from '../../hooks/useClickOutside';

const CHEVRON = (
  <svg className="multi-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Read-only badge list (non-admins) or an editable checkbox dropdown (admins)
// for a player's roles - a player can hold any number of roles at once.
export default function RoleMultiSelect({ roles, editable, onToggle }) {
  const active = ROLE_DEFS.filter((r) => roles.includes(r.id));
  const detailsRef = useRef(null);
  // <details open> must be driven by React state, not left uncontrolled -
  // otherwise React resets it to closed on every re-render (e.g. after each
  // checkbox toggle updates the player list), closing the menu mid-use.
  const [open, setOpen] = useState(false);

  useClickOutside(detailsRef, editable && open, () => setOpen(false));

  if (!editable) {
    return (
      <div className="role-chip-row">
        {active.length === 0 && <span className="role-chip-empty">&mdash;</span>}
        {active.map((role) => (
          <span key={role.id} className={`role-chip active readonly ${role.id}`}>
            {role.label}
          </span>
        ))}
      </div>
    );
  }

  const summary = active.length === 0 ? 'No roles' : active.map((r) => r.label).join(', ');

  return (
    <details
      className="multi-select"
      ref={detailsRef}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="multi-select-summary" title={summary}>
        <span className="multi-select-summary-text">{summary}</span>
        {CHEVRON}
      </summary>
      <div className="multi-select-menu">
        {ROLE_DEFS.map((role) => (
          <label key={role.id} className="multi-select-option">
            <input type="checkbox" checked={roles.includes(role.id)} onChange={() => onToggle(role.id)} />
            <span className={`role-dot ${role.id}`} />
            {role.label}
          </label>
        ))}
      </div>
    </details>
  );
}
