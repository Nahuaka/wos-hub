import titanRoc from '../assets/pets/titanRoc.jpg';
import snowLeopard from '../assets/pets/snowLeopard.jpg';
import caveLion from '../assets/pets/caveLion.jpg';
import ironRhino from '../assets/pets/ironRhino.jpg';
import sabertoothTiger from '../assets/pets/sabertoothTiger.jpg';
import mammoth from '../assets/pets/mammoth.jpg';
import frostGorilla from '../assets/pets/frostGorilla.jpg';
import frostscaleChameleon from '../assets/pets/frostscaleChameleon.jpg';
import snowApeImg from '../assets/pets/snow-ape.jpg';

export const PET_DEFS = [
  { key: 'titanRoc', name: 'Titan Roc', desc: 'Reduces enemy health', max: 7, image: titanRoc },
  { key: 'snowLeopard', name: 'Snow Leopard', desc: 'March speed + reduces enemy lethality', max: 8, image: snowLeopard },
  { key: 'caveLion', name: 'Cave Lion', desc: 'Troops attack', max: 10, image: caveLion },
  { key: 'ironRhino', name: 'Iron Rhino', desc: 'Rally Capacity - only while pet active', max: 10, image: ironRhino },
  { key: 'sabertoothTiger', name: 'Sabertooth Tiger', desc: 'Troops lethality', max: 10, image: sabertoothTiger },
  { key: 'mammoth', name: 'Mammoth', desc: 'Troops defense', max: 10, image: mammoth },
  { key: 'frostGorilla', name: 'Frost Gorilla', desc: 'Troops health', max: 10, image: frostGorilla },
  { key: 'frostscaleChameleon', name: 'Frostscale Chameleon', desc: 'Reduces enemy defense', max: 10, image: frostscaleChameleon },
];

export const PET_POWER_MAX = '58,281,120';

export const SNOW_APE_IMAGE = snowApeImg;

export function freshPetLevels() {
  const levels = {};
  PET_DEFS.forEach((p) => {
    levels[p.key] = 1;
  });
  return levels;
}
