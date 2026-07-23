import { useAppData } from '../../context/AppDataContext';
import { PET_DEFS, PET_POWER_MAX } from '../../data/petDefs';
import CollapsibleCard from '../common/CollapsibleCard';
import LevelSelect from '../common/LevelSelect';

export default function PetCard() {
  const { currentAccount, patchCurrentAccountJson, patchCurrentAccount } = useAppData();
  if (!currentAccount) return null;

  const petLevels = currentAccount.rally?.petLevels || {};

  function updateLevel(key, level) {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      petLevels: { ...rally.petLevels, [key]: level },
    }));
  }

  function maxPetPower() {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      petPower: PET_POWER_MAX,
      petLevels: Object.fromEntries(PET_DEFS.map((p) => [p.key, p.max])),
    }));
  }

  return (
    <CollapsibleCard
      icon={<>&#128062;</>}
      iconColor="purple"
      accentColor="purple"
      title="PET"
      headerExtra={
        <button
          className="btn-max"
          onClick={(e) => {
            e.stopPropagation();
            maxPetPower();
          }}
        >
          MAX
        </button>
      }
    >
      <div className="pet-list">
        {PET_DEFS.map((p) => (
          <div className="pet-tile" key={p.key}>
            <div className="pet-tile-top">
              <div className="pet-icon">
                <img src={p.image} alt={p.name} />
              </div>
              <div>
                <div className="pet-name">{p.name}</div>
                <div className="pet-desc">{p.desc}</div>
              </div>
            </div>
            <LevelSelect
              className="pet-level-select"
              min={1}
              max={p.max}
              value={petLevels[p.key] || 1}
              onChange={(level) => updateLevel(p.key, level)}
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
