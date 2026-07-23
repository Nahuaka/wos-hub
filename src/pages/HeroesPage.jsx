import { useAppData } from '../context/AppDataContext';
import { SSR_GENS, HERO_ROSTER, SSR_TOTAL, SR_TOTAL } from '../data/heroRoster';
import HeroSection from '../components/heroes/HeroSection';

export default function HeroesPage() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();
  if (!currentAccount) return null;

  const heroStates = currentAccount.heroes || {};
  const rallyLeadOn = currentAccount.rally_lead !== false;

  const ssrOwned = HERO_ROSTER.filter((h) => h.rarity === 'SSR' && heroStates[h.slug]?.owned).length;
  const srOwned = HERO_ROSTER.filter((h) => h.rarity === 'SR' && heroStates[h.slug]?.owned).length;

  function toggleOwned(slug, checked) {
    patchCurrentAccountJson('heroes', (heroes) => ({
      ...heroes,
      [slug]: { ...heroes[slug], owned: checked },
    }));
  }

  function setWidget(slug, level) {
    patchCurrentAccountJson('heroes', (heroes) => ({
      ...heroes,
      [slug]: { ...heroes[slug], widget: level },
    }));
  }

  function selectAllByRarity(rarity) {
    patchCurrentAccountJson('heroes', (heroes) => {
      const next = { ...heroes };
      HERO_ROSTER.forEach((h) => {
        if (h.rarity === rarity) next[h.slug] = { ...next[h.slug], owned: true };
      });
      return next;
    });
  }

  function setAllWidgetsMax() {
    patchCurrentAccountJson('heroes', (heroes) => {
      const next = { ...heroes };
      HERO_ROSTER.forEach((h) => {
        if (h.rarity === 'SSR') next[h.slug] = { ...next[h.slug], widget: 10 };
      });
      return next;
    });
  }

  return (
    <div className="view active account-page-el">
      <div className="card hero-summary-card">
        <div className="hero-summary-item">
          <span className="hero-summary-label gold">SSR</span>
          <span className="hero-summary-value">
            {ssrOwned} / {SSR_TOTAL}
          </span>
        </div>
        <div className="hero-summary-divider" />
        <div className="hero-summary-item">
          <span className="hero-summary-label purple">SR</span>
          <span className="hero-summary-value">
            {srOwned} / {SR_TOTAL}
          </span>
        </div>
      </div>

      <div className="heroes-toolbar">
        <button className="btn-outline gold" onClick={() => selectAllByRarity('SSR')}>
          Select All SSR Heroes
        </button>
        <button className="btn-outline purple" onClick={() => selectAllByRarity('SR')}>
          Select All SR Heroes
        </button>
        <button className="btn-outline teal" onClick={setAllWidgetsMax}>
          Set All Widgets to Level 10
        </button>
      </div>

      <div>
        {SSR_GENS.map((g) => (
          <HeroSection
            key={g.gen}
            title={`GEN ${g.gen}`}
            heroes={HERO_ROSTER.filter((h) => h.rarity === 'SSR' && h.gen === g.gen)}
            heroStates={heroStates}
            rallyLeadOn={rallyLeadOn}
            onToggleOwned={toggleOwned}
            onWidgetChange={setWidget}
          />
        ))}
        <HeroSection
          title="SR HEROES"
          heroes={HERO_ROSTER.filter((h) => h.rarity === 'SR')}
          heroStates={heroStates}
          rallyLeadOn={rallyLeadOn}
          onToggleOwned={toggleOwned}
          onWidgetChange={setWidget}
        />
      </div>

      <div className="footer-tag">WOS HUB &middot; S 1518</div>
    </div>
  );
}
