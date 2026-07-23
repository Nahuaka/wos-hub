import { useAppData } from '../../context/AppDataContext';
import CollapsibleCard from '../common/CollapsibleCard';

export default function GearCard() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();
  if (!currentAccount) return null;

  const gear = currentAccount.rally?.gear || { chiefMaxed: false, heroMaxed: false, maxSquad: 0 };

  function updateField(field, value) {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      gear: { ...rally.gear, [field]: value },
    }));
  }

  function maxGear() {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      gear: { ...rally.gear, chiefMaxed: true, heroMaxed: true },
    }));
  }

  return (
    <CollapsibleCard
      icon={<>&#9881;&#65039;</>}
      iconColor="orange"
      accentColor="orange"
      title="GEAR"
      headerExtra={
        <button
          className="btn-max"
          onClick={(e) => {
            e.stopPropagation();
            maxGear();
          }}
        >
          MAX
        </button>
      }
    >
      <div className="gear-row">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={gear.chiefMaxed}
            onChange={(e) => updateField('chiefMaxed', e.target.checked)}
          />
          <span>Chief Gear Maxed</span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={gear.heroMaxed}
            onChange={(e) => updateField('heroMaxed', e.target.checked)}
          />
          <span>Hero Gear Maxed</span>
        </label>
        <div className="field gear-squad-field">
          <label>Number of Max Squad</label>
          <input
            type="number"
            min={0}
            step={1}
            value={gear.maxSquad}
            onChange={(e) => updateField('maxSquad', parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
