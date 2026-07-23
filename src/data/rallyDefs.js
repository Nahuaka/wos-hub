import { freshPetLevels } from './petDefs';
import { freshCharmLevels } from './charmDefs';

export const EXPERT_POWER_MAX = '126,430,700';
export const EXPERT_FIELDS = ['romulus', 'fabian', 'valeria'];

export function freshExpertState() {
  return { romulus: 1, fabian: 1, valeria: 1 };
}

export function freshGearState() {
  return { chiefMaxed: false, heroMaxed: false, maxSquad: 0 };
}

export function freshRallyState() {
  return {
    rallyCap: '0',
    islandScore: '0',
    petPower: '0',
    expertPower: '0',
    techPower: '0',
    petLevels: freshPetLevels(),
    expert: freshExpertState(),
    gear: freshGearState(),
    charmLevels: freshCharmLevels(),
  };
}
