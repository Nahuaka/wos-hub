// Static roster data for every hero in the game. This never changes at
// runtime, so it lives in a plain JS module rather than in Supabase -
// only each account's per-hero `owned`/`widget` state is persisted there.

import jeronimo from '../assets/heroes/jeronimo.jpg';
import natalia from '../assets/heroes/natalia.jpg';
import molly from '../assets/heroes/molly.jpg';
import zinman from '../assets/heroes/zinman.jpg';
import flint from '../assets/heroes/flint.jpg';
import philly from '../assets/heroes/philly.jpg';
import alonso from '../assets/heroes/alonso.jpg';
import logan from '../assets/heroes/logan.jpg';
import mia from '../assets/heroes/mia.jpg';
import greg from '../assets/heroes/greg.jpg';
import ahmose from '../assets/heroes/ahmose.jpg';
import reina from '../assets/heroes/reina.jpg';
import lynn from '../assets/heroes/lynn.jpg';
import hector from '../assets/heroes/hector.jpg';
import norah from '../assets/heroes/norah.jpg';
import gwen from '../assets/heroes/gwen.jpg';
import wuMing from '../assets/heroes/wu-ming.jpg';
import renee from '../assets/heroes/renee.jpg';
import wayne from '../assets/heroes/wayne.jpg';
import edith from '../assets/heroes/edith.jpg';
import gordon from '../assets/heroes/gordon.jpg';
import bradley from '../assets/heroes/bradley.jpg';
import gatot from '../assets/heroes/gatot.jpg';
import sonya from '../assets/heroes/sonya.jpg';
import hendrick from '../assets/heroes/hendrick.jpg';
import magnus from '../assets/heroes/magnus.jpg';
import fred from '../assets/heroes/fred.jpg';
import xura from '../assets/heroes/xura.jpg';
import gregory from '../assets/heroes/gregory.jpg';
import freya from '../assets/heroes/freya.jpg';
import blanchette from '../assets/heroes/blanchette.jpg';
import sergey from '../assets/heroes/sergey.jpg';
import jessie from '../assets/heroes/jessie.jpg';
import patrick from '../assets/heroes/patrick.jpg';
import bahiti from '../assets/heroes/bahiti.jpg';
import gina from '../assets/heroes/gina.jpg';
import walisBokman from '../assets/heroes/walis-bokman.jpg';
import jasser from '../assets/heroes/jasser.jpg';
import seoYun from '../assets/heroes/seo-yun.jpg';
import lingXue from '../assets/heroes/ling-xue.jpg';

// Ordered newest generation first, matching how the Heroes page displays them.
export const SSR_GENS = [
  { gen: 10, names: ['Gregory', 'Freya', 'Blanchette'] },
  { gen: 9, names: ['Magnus', 'Fred', 'Xura'] },
  { gen: 8, names: ['Gatot', 'Sonya', 'Hendrick'] },
  { gen: 7, names: ['Edith', 'Gordon', 'Bradley'] },
  { gen: 6, names: ['Wu Ming', 'Renee', 'Wayne'] },
  { gen: 5, names: ['Hector', 'Norah', 'Gwen'] },
  { gen: 4, names: ['Ahmose', 'Reina', 'Lynn'] },
  { gen: 3, names: ['Logan', 'Mia', 'Greg'] },
  { gen: 2, names: ['Flint', 'Philly', 'Alonso'] },
  { gen: 1, names: ['Jeronimo', 'Natalia', 'Molly', 'Zinman'] },
];

export const SR_HEROES = [
  'Sergey', 'Jessie', 'Patrick', 'Bahiti', 'Gina',
  'Walis Bokman', 'Jasser', 'Seo Yun', 'Ling Xue',
];

export function heroSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// slug -> imported image. Add a hero's slug here to show their portrait
// instead of the placeholder initials avatar.
export const HERO_IMAGES = {
  jeronimo, natalia, molly, zinman,
  flint, philly, alonso,
  logan, mia, greg,
  ahmose, reina, lynn,
  hector, norah, gwen,
  'wu-ming': wuMing, renee, wayne,
  edith, gordon, bradley,
  gatot, sonya, hendrick,
  magnus, fred, xura,
  gregory, freya, blanchette,
  sergey, jessie, patrick, bahiti, gina,
  'walis-bokman': walisBokman, jasser, 'seo-yun': seoYun, 'ling-xue': lingXue,
};

export const HERO_ROSTER = [
  ...SSR_GENS.flatMap((g) =>
    g.names.map((name) => ({ slug: heroSlug(name), name, rarity: 'SSR', gen: g.gen }))
  ),
  ...SR_HEROES.map((name) => ({ slug: heroSlug(name), name, rarity: 'SR', gen: null })),
];

export const SSR_TOTAL = HERO_ROSTER.filter((h) => h.rarity === 'SSR').length;
export const SR_TOTAL = HERO_ROSTER.filter((h) => h.rarity === 'SR').length;

export function heroInitials(name) {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function freshHeroState() {
  const state = {};
  HERO_ROSTER.forEach((h) => {
    state[h.slug] = { owned: false, widget: 0 };
  });
  return state;
}
