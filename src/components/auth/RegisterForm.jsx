import { useEffect, useState } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { slugify } from '../../lib/utils';
import { freshTroopState } from '../../data/troopDefs';
import { freshRallyState } from '../../data/rallyDefs';
import { freshHeroState } from '../../data/heroRoster';
import TroopsFields from '../common/TroopsFields';

export default function RegisterForm({ onSwitchToLogin }) {
  const { register, login } = useAuth();
  const [step, setStep] = useState('id-entry');
  const [alliances, setAlliances] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [checking, setChecking] = useState(false);

  const [playerExists, setPlayerExists] = useState(false);
  const [existingAccountKey, setExistingAccountKey] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [allianceTag, setAllianceTag] = useState('');
  const [accountName, setAccountName] = useState('');
  const [power, setPower] = useState('');
  const [march, setMarch] = useState('');
  const [furnace, setFurnace] = useState('1');
  const [rallyLead, setRallyLead] = useState(false);
  const [troops, setTroops] = useState(freshTroopState());
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.fetchAlliances().then(setAlliances).catch(() => setAlliances([]));
  }, []);

  async function handleIdSubmit(e) {
    e.preventDefault();
    const id = playerId.trim();
    if (!id || !password) return;
    setChecking(true);
    setIdError('');
    try {
      const result = await api.checkPlayerRegistrationStatus(id);
      if (result.status === 'linked') {
        setIdError('This player ID already has an account.');
        return;
      }
      if (result.status === 'unlinked') {
        setPlayerExists(true);
        setExistingAccountKey(result.account?.key ?? null);
        setPlayerName(result.player.name);
        setAllianceTag(result.player.alliance_tag || '');
        if (result.account) {
          setAccountName(result.account.name);
          setPower(result.account.power);
          setMarch(result.account.march);
          setFurnace(String(result.account.furnace));
          setRallyLead(!!result.account.rally_lead);
          setTroops(result.account.troops || freshTroopState());
        } else {
          setAccountName(result.player.name);
        }
      } else {
        setPlayerExists(false);
        setExistingAccountKey(null);
        setPlayerName('');
        setAllianceTag('');
        setAccountName('');
      }
      setStep('review');
    } catch {
      setIdError('Something went wrong checking that player ID. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!playerName.trim() || !accountName.trim()) {
      setReviewError('Player name and account nickname are required.');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    const id = playerId.trim();
    try {
      const user = await register(id, password);
      const furnaceValue = furnace.trim() || '1';

      // Player row: link the existing one, or create a bare one, but never
      // both - the player already exists in the "unlinked" path regardless
      // of whether they also have an account yet.
      if (playerExists) {
        await api.linkPlayerAuthUser(id, user.id);
        await api.updatePlayerInfo(id, { name: playerName.trim(), alliance_tag: allianceTag || null });
      } else {
        await api.insertPlayer({
          id,
          name: playerName.trim(),
          alliance_tag: allianceTag || null,
          permission: 'Players',
          roles: [],
          auth_user_id: user.id,
        });
      }

      // Account row: update the existing one, or create a new one.
      if (existingAccountKey) {
        await api.updateAccount(existingAccountKey, {
          name: accountName.trim(),
          power: power.trim() || '0',
          march: march.trim() || '0',
          furnace: furnaceValue,
          rally_lead: rallyLead,
          troops,
        });
      } else {
        await api.insertAccount({
          key: slugify(accountName.trim(), []),
          player_id: id,
          name: accountName.trim(),
          power: power.trim() || '0',
          march: march.trim() || '0',
          furnace: furnaceValue,
          rally_lead: rallyLead,
          snow_ape_level: 1,
          troops,
          rally: freshRallyState(),
          heroes: freshHeroState(),
        });
      }
      // Only now flip the app-wide session - see the comment on
      // AuthContext.register for why this has to come after the writes.
      await login(id, password);
    } catch {
      setReviewError(
        'Your login was created, but saving your account details failed. Please contact an admin for help.'
      );
      setSubmitting(false);
    }
  }

  if (step === 'id-entry') {
    return (
      <form className="modal-body" onSubmit={handleIdSubmit}>
        <div className="field">
          <label>Player ID</label>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="e.g. 80472391"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Choose a Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {idError && (
          <div className="field-hint error">
            {idError}{' '}
            {idError.includes('already has') && (
              <button type="button" className="link-button" onClick={onSwitchToLogin}>
                Log in instead
              </button>
            )}
          </div>
        )}
        <button className="btn-primary auth-submit" type="submit" disabled={checking}>
          {checking ? 'Checking…' : 'Continue'}
        </button>
        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="modal-body" onSubmit={handleReviewSubmit}>
      <div className="field-row">
        <div className="field">
          <label>Player Name</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        </div>
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
      </div>

      <div className="field">
        <label>Account Nickname</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="[FLG] YourName"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Total Power</label>
          <input type="text" value={power} onChange={(e) => setPower(e.target.value)} placeholder="e.g. 50.0M" />
        </div>
        <div className="field">
          <label>March Capacity</label>
          <input type="text" value={march} onChange={(e) => setMarch(e.target.value)} placeholder="e.g. 100,000" />
        </div>
      </div>

      <div className="field">
        <label>Furnace Level</label>
        <input type="text" value={furnace} onChange={(e) => setFurnace(e.target.value)} placeholder="e.g. 30 or 30-4" />
      </div>

      <label className="checkbox-row" style={{ margin: '4px 0 16px 0' }}>
        <input type="checkbox" checked={rallyLead} onChange={(e) => setRallyLead(e.target.checked)} />
        I am a Rally Lead
      </label>

      <label className="modal-section-label">Troops Setup</label>
      <TroopsFields troops={troops} onChange={setTroops} />

      {reviewError && <div className="field-hint error">{reviewError}</div>}
      <button className="btn-primary auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
