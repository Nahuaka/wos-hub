import { useState } from 'react';
import Modal from '../common/Modal';
import { TROOP_META, TROOP_TYPES, FC_OPTIONS, LANCER_ICON_SRC, freshTroopState } from '../../data/troopDefs';
import { useAppData } from '../../context/AppDataContext';

export default function AddAccountModal({ open, onClose }) {
  const { createAccount, players } = useAppData();
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [power, setPower] = useState('');
  const [march, setMarch] = useState('');
  const [troops, setTroops] = useState(freshTroopState());
  const [nameError, setNameError] = useState(false);

  function resetForm() {
    setName('');
    setPlayerId('');
    setPower('');
    setMarch('');
    setTroops(freshTroopState());
    setNameError(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function updateTroopField(type, field, value) {
    setTroops((prev) => {
      const next = { ...prev, [type]: { ...prev[type], [field]: value } };
      if (field === 'tier' && value !== 'T12') next[type].skill = 0;
      return next;
    });
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    await createAccount({
      name: name.trim(),
      playerId: playerId || null,
      power: power.trim() || '0',
      march: march.trim() || '0',
      troops,
    });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Account"
      wide
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Create Account
          </button>
        </>
      }
    >
      <div className="field-row">
        <div className="field">
          <label>Account Name</label>
          <input
            type="text"
            className={nameError ? 'field-error' : ''}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="[FLG] YourName"
          />
        </div>
        <div className="field">
          <label>Linked Player (optional)</label>
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">None</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="modal-section-label">Troops Setup</label>
      <div id="newAccTroopsContainer">
        {TROOP_TYPES.map((type) => {
          const meta = TROOP_META[type];
          const data = troops[type];
          return (
            <div className="modal-troop-row" key={type}>
              <div className="troop-config-header">
                <span className={`troop-config-icon ${meta.colorClass}`}>
                  {type === 'lancer' ? (
                    <img src={LANCER_ICON_SRC} alt="Lancer" style={{ width: 16, height: 16, display: 'block' }} />
                  ) : type === 'infantry' ? (
                    '\u{1F6E1}\uFE0F'
                  ) : (
                    '\u{1F3F9}'
                  )}
                </span>
                <span className={`troop-config-name ${meta.colorClass}`}>{meta.label}</span>
              </div>
              <div className="troop-config-fields">
                <div className="field">
                  <label>Troops Level</label>
                  <select value={data.fc} onChange={(e) => updateTroopField(type, 'fc', e.target.value)}>
                    {FC_OPTIONS.map((fc) => (
                      <option key={fc} value={fc}>
                        {fc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Troops Type</label>
                  <select value={data.tier} onChange={(e) => updateTroopField(type, 'tier', e.target.value)}>
                    <option value="T11">T11 - Hélios</option>
                    <option value="T12">T12 - Exalted</option>
                  </select>
                </div>
                <div className={`field ${data.tier === 'T12' ? '' : 'field-disabled'}`}>
                  <label>Troops Skill</label>
                  <select
                    disabled={data.tier !== 'T12'}
                    value={data.skill}
                    onChange={(e) => updateTroopField(type, 'skill', parseInt(e.target.value, 10))}
                  >
                    <option value={0}>Skill 0</option>
                    <option value={1}>Skill 1</option>
                    <option value={2}>Skill 2</option>
                    <option value={3}>Skill 3</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="field-row" style={{ marginTop: 4 }}>
        <div className="field">
          <label>Total Power</label>
          <input type="text" value={power} onChange={(e) => setPower(e.target.value)} placeholder="e.g. 50.0M" />
        </div>
        <div className="field">
          <label>March Capacity</label>
          <input type="text" value={march} onChange={(e) => setMarch(e.target.value)} placeholder="e.g. 100,000" />
        </div>
      </div>
    </Modal>
  );
}
