import { useEffect } from 'react';

// Calls onOutside when a click lands outside the element `ref` points to.
// Used by dropdown-style components (open/close on outside click).
export function useClickOutside(ref, enabled, onOutside) {
  useEffect(() => {
    if (!enabled) return undefined;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ref, enabled, onOutside]);
}
