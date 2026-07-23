import { useAppData } from '../../context/AppDataContext';
import { EXPERT_POWER_MAX } from '../../data/rallyDefs';
import CollapsibleCard from '../common/CollapsibleCard';

const FIELDS = [
  { key: 'romulus', label: 'Romulus Level' },
  { key: 'fabian', label: 'Fabian Level' },
  { key: 'valeria', label: 'Valeria Level' },
];

function clamp(v) {
  let n = parseInt(v, 10);
  if (Number.isNaN(n)) n = 1;
  return Math.max(1, Math.min(100, n));
}

export default function ExpertCard() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();
  if (!currentAccount) return null;

  const expert = currentAccount.rally?.expert || { romulus: 1, fabian: 1, valeria: 1 };

  function updateField(key, value) {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      expert: { ...rally.expert, [key]: clamp(value) },
    }));
  }

  function maxExpertPower() {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      expertPower: EXPERT_POWER_MAX,
      expert: { romulus: 100, fabian: 100, valeria: 100 },
    }));
  }

  return (
    <CollapsibleCard
      icon={<>&#128081;</>}
      iconColor="gold"
      accentColor="gold"
      title="EXPERT"
      headerExtra={
        <button
          className="btn-max"
          onClick={(e) => {
            e.stopPropagation();
            maxExpertPower();
          }}
        >
          MAX
        </button>
      }
    >
      <div className="expert-fields">
        {FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={expert[f.key]}
              onChange={(e) => updateField(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
