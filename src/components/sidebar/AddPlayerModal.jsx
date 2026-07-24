import { useState } from 'react';
import Modal from '../common/Modal';
import { useAppData } from '../../context/AppDataContext';

const PERMISSION_LEVELS = ['Admin', 'Team Maker', 'Battle Strat', 'Player Manager', 'Players'];

// Admin-only: creates a bare, unclaimed player record (no login/password) -
// the person it belongs to can later set a password for it from the
// registration screen, which finds it as an "existing, unlinked" ID.
export default function AddPlayerModal({ open, onClose }) {
  const { addPlayer, players, alliances } = useAppData();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [allianceTag, setAllianceTag] = useState('');
  const [permission, setPermission] = useState('Players');
  const [error, setError] = useState('');

  function resetForm() {
    setId('');
    setName('');
    setAllianceTag('');
    setPermission('Players');
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const trimmedId = id.trim();
    if (!trimmedId || !name.trim()) {
      setError('Player ID and name are required.');
      return;
    }
    if (players.some((p) => p.id === trimmedId)) {
      setError('A player with this ID already exists.');
      return;
    }
    await addPlayer({ id: trimmedId, name: name.trim(), allianceTag, permission });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Player"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Add Player
          </button>
        </>
      }
    >
      <div className="field-row">
        <div className="field">
          <label>Player ID</label>
          <input
            type="text"
            className={error ? 'field-error' : ''}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. 80472391"
          />
        </div>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            className={error ? 'field-error' : ''}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Alliance</label>
          <select value={allianceTag} onChange={(e) => setAllianceTag(e.target.value)}>
            <option value="">None</option>
            {alliances.map((a) => (
              <option key={a.tag} value={a.tag}>
                {a.tag}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Permission</label>
          <select value={permission} onChange={(e) => setPermission(e.target.value)}>
            {PERMISSION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="field-hint error">{error}</div>}
    </Modal>
  );
}
