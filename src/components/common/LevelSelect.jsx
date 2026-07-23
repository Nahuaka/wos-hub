/**
 * A <select> populated with a range of integer levels.
 * `options` overrides the generated range entirely when provided (used for
 * the charm selects, which count down from 16 rather than up from 1).
 */
export default function LevelSelect({
  value,
  onChange,
  min = 1,
  max = 10,
  options = null,
  className = '',
  labelPrefix = 'Level',
}) {
  const levels = options || Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <select className={className} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))}>
      {levels.map((lvl) => (
        <option key={lvl} value={lvl}>
          {labelPrefix} {lvl}
        </option>
      ))}
    </select>
  );
}
