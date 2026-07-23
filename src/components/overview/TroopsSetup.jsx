import { useAppData } from '../../context/AppDataContext';
import { TROOP_META, TROOP_TYPES, FC_OPTIONS, LANCER_ICON_SRC } from '../../data/troopDefs';

export default function TroopsSetup() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();

  if (!currentAccount) return null;
  const troops = currentAccount.troops || {};

  function updateField(type, field, value) {
    patchCurrentAccountJson('troops', (prev) => {
      const next = { ...prev, [type]: { ...prev[type], [field]: value } };
      if (field === 'tier' && value !== 'T12') next[type].skill = 0;
      return next;
    });
  }

  return (
    <>
      <div className="section-title-row">
        <div className="section-title">TROOPS SETUP</div>
      </div>
      <div className="card">
        <div className="troop-config-list">
          {TROOP_TYPES.map((type) => {
            const meta = TROOP_META[type];
            const data = troops[type] || { fc: 'FC1', tier: 'T11', skill: 0 };
            return (
              <div className="troop-config-row" key={type}>
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
      </div>
    </>
  );
}
