import { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

const CHEVRON = (
  <svg className="alliance-picker-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Displays an alliance tag as plain text with its color dot. When
// `editable`, clicking it reveals a dropdown list of every alliance to
// switch to - looks like normal text until you interact with it, unlike a
// boxed <select>.
export default function AllianceSelect({ alliances, value, onChange, editable, placeholder = 'No Alliance' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, editable && open, () => setOpen(false));

  const current = alliances.find((a) => a.tag === value);
  const dot = current && <span className="p-alliance-dot" style={{ background: current.color }} />;

  if (!editable) {
    return (
      <span className="alliance-display">
        {dot}
        {value || placeholder}
      </span>
    );
  }

  return (
    <div className="alliance-picker" ref={ref}>
      <button type="button" className="alliance-picker-trigger" onClick={() => setOpen((o) => !o)}>
        {dot}
        <span>{value || placeholder}</span>
        {CHEVRON}
      </button>
      {open && (
        <div className="alliance-picker-menu">
          <button
            type="button"
            className="alliance-picker-option"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            No Alliance
          </button>
          {alliances.map((a) => (
            <button
              key={a.tag}
              type="button"
              className="alliance-picker-option"
              onClick={() => {
                onChange(a.tag);
                setOpen(false);
              }}
            >
              <span className="p-alliance-dot" style={{ background: a.color }} />
              {a.tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
