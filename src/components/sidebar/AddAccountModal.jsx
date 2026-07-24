import { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import TroopsFields from '../common/TroopsFields';
import { freshTroopState } from '../../data/troopDefs';
import { useAppData } from '../../context/AppDataContext';

export default function AddAccountModal({ open, onClose }) {
  const { createAccount, players, accounts } = useAppData();
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [power, setPower] = useState('');
  const [march, setMarch] = useState('');
  const [troops, setTroops] = useState(freshTroopState());
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const trimmedId = playerId.trim();
  const matchedPlayer = useMemo(
    () => (trimmedId ? players.find((p) => p.id === trimmedId) : null),
    [players, trimmedId]
  );
  const matchedAccount = useMemo(
    () => (matchedPlayer ? accounts.find((a) => a.player_id === matchedPlayer.id) : null),
    [accounts, matchedPlayer]
  );
  const idIsTaken = !!matchedPlayer?.auth_user_id;
  // Claiming an ID (new or existing-unlinked) needs its own login set up.
  const needsPassword = !!trimmedId && !idIsTaken;

  function resetForm() {
    setName('');
    setPlayerId('');
    setPassword('');
    setPower('');
    setMarch('');
    setTroops(freshTroopState());
    setNameError(false);
    setPasswordError(false);
    setSubmitError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handlePlayerIdChange(value) {
    setPlayerId(value);
    const trimmed = value.trim();
    const player = trimmed ? players.find((p) => p.id === trimmed) : null;
    if (player && !player.auth_user_id) {
      const account = accounts.find((a) => a.player_id === player.id);
      setName(account ? account.name : player.name);
      if (account) {
        setPower(account.power);
        setMarch(account.march);
        setTroops(account.troops || freshTroopState());
      }
    }
  }

  async function handleSubmit() {
    if (idIsTaken) return;
    let hasError = false;
    if (!name.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }
    if (needsPassword && !password) {
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }
    if (hasError) return;

    setSubmitError('');
    try {
      await createAccount({
        name: name.trim(),
        playerId: trimmedId || null,
        power: power.trim() || '0',
        march: march.trim() || '0',
        troops,
        existingAccountKey: matchedAccount?.key,
        password,
      });
      handleClose();
    } catch {
      setSubmitError('Could not create that account - the player ID may already be taken. Please try again.');
    }
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
          <button className="btn-primary" onClick={handleSubmit} disabled={idIsTaken}>
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
          <label>Player ID</label>
          <input
            type="text"
            className={idIsTaken ? 'field-error' : ''}
            value={playerId}
            onChange={(e) => handlePlayerIdChange(e.target.value)}
            placeholder="e.g. 80472391"
          />
          {idIsTaken && <div className="field-hint error">This player ID is already in use.</div>}
          {!idIsTaken && matchedPlayer && (
            <div className="field-hint">
              Existing player found - {matchedAccount ? 'account details prefilled below.' : 'fields prefilled.'}
            </div>
          )}
        </div>
      </div>

      {needsPassword && (
        <div className="field">
          <label>Set a Password for This ID</label>
          <input
            type="password"
            className={passwordError ? 'field-error' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="field-hint">This lets you log in later using this player ID too.</div>
        </div>
      )}

      <label className="modal-section-label">Troops Setup</label>
      <TroopsFields troops={troops} onChange={setTroops} />

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
      {submitError && <div className="field-hint error">{submitError}</div>}
    </Modal>
  );
}
