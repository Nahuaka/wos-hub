import lancerSpear from '../assets/icons/lancer-spear.png';

export const TROOP_META = {
  infantry: { label: 'Infantry', colorClass: 'infantry' },
  lancer: { label: 'Lancer', colorClass: 'lancer' },
  marksman: { label: 'Marksman', colorClass: 'marksman' },
};

export const TROOP_TYPES = Object.keys(TROOP_META);
export const FC_OPTIONS = Array.from({ length: 10 }, (_, i) => `FC${i + 1}`);
export const LANCER_ICON_SRC = lancerSpear;

export function freshTroopState() {
  const state = {};
  TROOP_TYPES.forEach((type) => {
    state[type] = { fc: 'FC1', tier: 'T11', skill: 0 };
  });
  return state;
}
