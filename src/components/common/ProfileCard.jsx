import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import AllianceSelect from './AllianceSelect';

export default function ProfileCard() {
  const {
    currentAccount,
    patchCurrentAccount,
    players,
    alliances,
    isCurrentUserAdmin,
    myOwnerRoot,
    setPlayerAlliance,
  } = useAppData();
  const [copied, setCopied] = useState(false);

  if (!currentAccount) return null;

  const rallyLeadOn = currentAccount.rally_lead !== false;
  const displayId = currentAccount.player_id || currentAccount.key;
  const player = players.find((p) => p.id === currentAccount.player_id);
  const canEditAlliance = !!player && (isCurrentUserAdmin || (player.owner_player_id || player.id) === myOwnerRoot);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayId);
    } catch {
      // Fallback for browsers that block the async clipboard API.
      const ta = document.createElement('textarea');
      ta.value = displayId;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function toggleRallyLead() {
    patchCurrentAccount({ rally_lead: !rallyLeadOn });
  }

  return (
    <div className="card profile-card account-page-el">
      <div className="profile-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#bcd9ff" strokeWidth="1.6">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      </div>
      <div className="profile-info">
        <div className="profile-name-row">
          {player && (
            <AllianceSelect
              alliances={alliances}
              value={player.alliance_tag}
              editable={canEditAlliance}
              onChange={(tag) => setPlayerAlliance(player.id, tag)}
            />
          )}
          <div className="profile-name">{currentAccount.name}</div>
        </div>
        <div className="profile-id">
          ID <span>{displayId}</span>{' '}
          <span className={`copy${copied ? ' copied' : ''}`} onClick={handleCopy} title="Copy ID">
            &#10697;
          </span>
          <span className={`copy-feedback${copied ? ' show' : ''}`}>Copied!</span>
        </div>
      </div>
      <div className="rally-toggle">
        <span className="label">Rally Lead</span>
        <div className={`switch${rallyLeadOn ? '' : ' off'}`} onClick={toggleRallyLead} />
      </div>
    </div>
  );
}
