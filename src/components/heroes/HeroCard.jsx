import { HERO_IMAGES, heroInitials } from '../../data/heroRoster';
import LevelSelect from '../common/LevelSelect';

export default function HeroCard({ hero, state, rallyLeadOn, onToggleOwned, onWidgetChange }) {
  const rarityClass = hero.rarity === 'SSR' ? 'ssr' : 'sr';
  const image = HERO_IMAGES[hero.slug];
  const showWidget = rallyLeadOn && hero.rarity === 'SSR';

  return (
    <div className="hero2-card">
      <div className="hero2-tag-stack">
        <span className={`rarity-tag ${rarityClass}`}>{hero.rarity}</span>
        <input
          type="checkbox"
          className={`hero2-owned-checkbox ${rarityClass}`}
          title="Owned"
          checked={state.owned}
          onChange={(e) => onToggleOwned(hero.slug, e.target.checked)}
        />
      </div>
      <div className="hero2-top">
        <div className={`hero2-avatar ${rarityClass}`}>
          {image ? <img src={image} alt={hero.name} /> : heroInitials(hero.name)}
        </div>
        <div className="hero2-meta">
          <div className="hero2-name">{hero.name}</div>
        </div>
      </div>
      {showWidget && (
        <div className="hero2-controls">
          <div className="field">
            <label>Widget Level</label>
            <LevelSelect
              min={0}
              max={10}
              value={state.widget}
              onChange={(level) => onWidgetChange(hero.slug, level)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
