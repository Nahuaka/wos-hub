// Switches between the Supabase-backed API and a localStorage-backed one,
// so the app can run without a Supabase project (set VITE_USE_LOCAL_DATA=true
// in .env). AppDataContext only ever imports from here.
import * as local from './localApi';
import * as remote from './supabaseApi';

const impl = import.meta.env.VITE_USE_LOCAL_DATA === 'true' ? local : remote;

export const {
  fetchAccounts,
  insertAccount,
  updateAccount,
  deleteAccount,
  fetchPlayers,
  updatePlayerPermission,
  updatePlayerRoles,
  insertPlayer,
  updatePlayerInfo,
  linkPlayerAuthUser,
  checkPlayerRegistrationStatus,
  deletePlayer,
  fetchAlliances,
  insertAlliance,
  updateAllianceColor,
  deleteAlliance,
  fetchEvents,
  insertEvent,
  updateEvent,
  deleteEvent,
} = impl;
