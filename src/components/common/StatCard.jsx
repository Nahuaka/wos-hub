import { useRef } from 'react';

/**
 * A stat card with a label and a big value. If `onChange` is provided, the
 * value becomes click-to-edit (matching the original prototype's
 * contenteditable stat cards).
 */
export default function StatCard({
  label,
  value,
  color = 'teal',
  editable = false,
  onChange,
  icon = null,
  large = false,
  sub = null,
  headExtra = null,
}) {
  const ref = useRef(null);

  function handleBlur() {
    if (!editable || !onChange) return;
    const clean = ref.current.textContent.replace(/\s+/g, ' ').trim() || '0';
    ref.current.textContent = clean;
    onChange(clean);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      ref.current.blur();
    }
  }

  return (
    <div className={`stat-card${large ? ' stat-card-lg' : ''}`}>
      <div className="stat-head">
        {label}
        {icon}
        {headExtra}
      </div>
      {editable ? (
        <div
          ref={ref}
          className={`stat-value ${color} editable`}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          title="Click to edit"
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          {value}
        </div>
      ) : (
        <div className={`stat-value ${color}`}>{value}</div>
      )}
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
