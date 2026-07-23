import { useAppData } from '../../context/AppDataContext';
import {
  CHARM_LINES,
  CHARM_SLOTS,
  CHARM_LEVEL_OPTIONS,
  CHARM_MAX_LEVEL,
  CHARM_ITEM_IMAGES,
  CHARM_TYPES,
  freshCharmLevels,
} from '../../data/charmDefs';
import CollapsibleCard from '../common/CollapsibleCard';
import LevelSelect from '../common/LevelSelect';
import useIsNarrowScreen from '../../hooks/useIsNarrowScreen';

function CharmBlock({ type, levels, onChange, labelPrefix }) {
  return (
    <div className="charm-block">
      <div className="troop-config-header">
        <span className="troop-config-name">{type}</span>
      </div>
      <div className="troop-config-fields">
        {CHARM_SLOTS.map((slot) => (
          <div className="field" key={slot}>
            <label>{slot.charAt(0).toUpperCase() + slot.slice(1)}</label>
            <LevelSelect
              options={CHARM_LEVEL_OPTIONS}
              value={levels[slot]}
              onChange={(level) => onChange(type, slot, level)}
              labelPrefix={labelPrefix}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CharmCard() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();
  const isNarrow = useIsNarrowScreen(700);
  if (!currentAccount) return null;

  const charmLevels = currentAccount.rally?.charmLevels || freshCharmLevels();
  const labelPrefix = isNarrow ? 'Lvl' : 'Level';

  function updateLevel(type, slot, level) {
    patchCurrentAccountJson('rally', (rally) => ({
      ...rally,
      charmLevels: {
        ...rally.charmLevels,
        [type]: { ...rally.charmLevels[type], [slot]: level },
      },
    }));
  }

  function maxCharms() {
    patchCurrentAccountJson('rally', (rally) => {
      const next = {};
      CHARM_TYPES.forEach((type) => {
        next[type] = { left: CHARM_MAX_LEVEL, top: CHARM_MAX_LEVEL, right: CHARM_MAX_LEVEL };
      });
      return { ...rally, charmLevels: next };
    });
  }

  return (
    <CollapsibleCard
      icon={<>&#128142;</>}
      iconColor="teal"
      accentColor="teal"
      title="CHARM"
      headerExtra={
        <button
          className="btn-max"
          onClick={(e) => {
            e.stopPropagation();
            maxCharms();
          }}
        >
          MAX
        </button>
      }
    >
      <div className="troop-config-list">
        {CHARM_LINES.map((line) => (
          <div className="charm-line" key={line.left}>
            <CharmBlock
              type={line.left}
              levels={charmLevels[line.left]}
              onChange={updateLevel}
              labelPrefix={labelPrefix}
            />
            <img className="charm-icon" src={CHARM_ITEM_IMAGES[line.leftIcon]} alt={line.left} />
            <img className="charm-icon" src={CHARM_ITEM_IMAGES[line.rightIcon]} alt={line.right} />
            <CharmBlock
              type={line.right}
              levels={charmLevels[line.right]}
              onChange={updateLevel}
              labelPrefix={labelPrefix}
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
