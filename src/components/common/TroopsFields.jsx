import { TROOP_META, TROOP_TYPES, FC_OPTIONS, LANCER_ICON_SRC } from '../../data/troopDefs';

// Controlled troop-setup editor (infantry/lancer/marksman × fc/tier/skill),
// shared by AddAccountModal and RegisterForm so the markup isn't duplicated.
export default function TroopsFields({ troops, onChange }) {
  function updateField(type, field, value) {
    const next = { ...troops, [type]: { ...troops[type], [field]: value } };
    if (field === 'tier' && value !== 'T12') next[type].skill = 0;
    onChange(next);
  }

  return (
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
                  '\u{1F6E1}️'
                ) : (
                  '\u{1F3F9}'
                )}
              </span>
              <span className={`troop-config-name ${meta.colorClass}`}>{meta.label}</span>
            </div>
            <div className="troop-config-fields">
              <div className="field">
                <label>Troops Level</label>
                <select value={data.fc} onChange={(e) => updateField(type, 'fc', e.target.value)}>
                  {FC_OPTIONS.map((fc) => (
                    <option key={fc} value={fc}>
                      {fc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Troops Type</label>
                <select value={data.tier} onChange={(e) => updateField(type, 'tier', e.target.value)}>
                  <option value="T11">T11 - Hélios</option>
                  <option value="T12">T12 - Exalted</option>
                </select>
              </div>
              <div className={`field ${data.tier === 'T12' ? '' : 'field-disabled'}`}>
                <label>Troops Skill</label>
                <select
                  disabled={data.tier !== 'T12'}
                  value={data.skill}
                  onChange={(e) => updateField(type, 'skill', parseInt(e.target.value, 10))}
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
  );
}
