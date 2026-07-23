import hat from '../assets/charms/hat.png';
import watch from '../assets/charms/watch.png';
import coat from '../assets/charms/coat.png';
import pants from '../assets/charms/pants.png';
import ring from '../assets/charms/ring.png';
import cudgel from '../assets/charms/cudgel.png';

export const CHARM_TYPES = ['Hat', 'Watch', 'Coat', 'Pants', 'Ring', 'Cudgel'];
export const CHARM_SLOTS = ['left', 'top', 'right'];
export const CHARM_LEVEL_OPTIONS = Array.from({ length: 16 }, (_, i) => 16 - i); // 16 down to 1
export const CHARM_MAX_LEVEL = 16;

export const CHARM_ITEM_IMAGES = { hat, watch, coat, pants, ring, cudgel };

// Each line pairs a left-column charm with a right-column charm, with the
// two illustrations sitting between them - matching how the Rally Lead
// page lays the Charm card out (max 3 lines).
export const CHARM_LINES = [
  { left: 'Hat', leftIcon: 'hat', rightIcon: 'watch', right: 'Watch' },
  { left: 'Coat', leftIcon: 'coat', rightIcon: 'pants', right: 'Pants' },
  { left: 'Ring', leftIcon: 'ring', rightIcon: 'cudgel', right: 'Cudgel' },
];

export function freshCharmLevels() {
  const levels = {};
  CHARM_TYPES.forEach((type) => {
    levels[type] = {};
    CHARM_SLOTS.forEach((slot) => {
      levels[type][slot] = 1;
    });
  });
  return levels;
}
