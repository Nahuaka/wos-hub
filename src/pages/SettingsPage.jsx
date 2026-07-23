import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

const TRASH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

const DEFAULT_COLORS = ['#3ddc97', '#6c9bff', '#ff9d42', '#c98cff', '#ffc94a', '#ff6b6b'];

export default function SettingsPage() {
  const { alliances, addAlliance, setAllianceColor, removeAlliance } = useAppData();
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [tagError, setTagError] = useState(false);

  async function handleAddAlliance() {
    const tag = newTag.trim().toUpperCase();
    if (!tag) {
      setTagError(true);
      return;
    }
    setTagError(false);
    try {
      await addAlliance(tag, newColor);
      setNewTag('');
      setNewColor(DEFAULT_COLORS[(alliances.length + 1) % DEFAULT_COLORS.length]);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    }
  }

  function handleDeleteAlliance(tag) {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete alliance "${tag}"? This does not remove players already assigned to it.`)) {
      removeAlliance(tag);
    }
  }

  return (
    <div>
      <div className="section-title-row">
        <div className="section-title">SETTINGS</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Refresh Website</div>
            <div className="settings-row-sub">Reload the app to fetch the latest data</div>
          </div>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="section-title-row">
        <div className="section-title">ALLIANCES</div>
      </div>
      <div className="card">
        <div className="alliance-add-row">
          <input
            type="text"
            className={tagError ? 'field-error' : ''}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New alliance tag (e.g. FLG)"
            maxLength={6}
          />
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
          <button className="btn-primary" onClick={handleAddAlliance}>
            Add Alliance
          </button>
        </div>

        {alliances.length === 0 && <div className="players-empty">No alliances yet. Add one above.</div>}
        {alliances.map((a) => (
          <div className="alliance-row" key={a.tag}>
            <input
              type="color"
              className="alliance-swatch"
              value={a.color}
              onChange={(e) => setAllianceColor(a.tag, e.target.value)}
              title="Change color"
            />
            <div className="alliance-row-name">{a.tag}</div>
            <button className="btn-delete-icon" title="Delete alliance" onClick={() => handleDeleteAlliance(a.tag)}>
              {TRASH_ICON}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
