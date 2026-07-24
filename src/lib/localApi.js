// Drop-in replacement for api.js that persists to localStorage instead of
// Supabase. Mirrors the same function signatures/shapes so AppDataContext
// doesn't need to know which backend is active. Seed data matches
// supabase/seed.sql so local dev looks the same as a freshly seeded project.

const STORAGE_KEY = 'wos-hub-local-data';

const freshCharmLevels = () => ({
  Hat: { left: 1, top: 1, right: 1 },
  Watch: { left: 1, top: 1, right: 1 },
  Coat: { left: 1, top: 1, right: 1 },
  Pants: { left: 1, top: 1, right: 1 },
  Ring: { left: 1, top: 1, right: 1 },
  Cudgel: { left: 1, top: 1, right: 1 },
});

const freshPetLevels = () => ({
  titanRoc: 1,
  snowLeopard: 1,
  caveLion: 1,
  ironRhino: 1,
  sabertoothTiger: 1,
  mammoth: 1,
  frostGorilla: 1,
  frostscaleChameleon: 1,
});

function seedData() {
  let t = Date.parse('2026-01-01T00:00:00Z');
  const ts = () => new Date((t += 1000)).toISOString();

  const alliances = [
    { tag: 'FLG', color: '#3ddc97', created_at: ts() },
    { tag: 'WNT', color: '#6c9bff', created_at: ts() },
    { tag: 'TDR', color: '#ff9d42', created_at: ts() },
  ];

  const players = [
    { id: '80472391', name: 'IceWarden', alliance_tag: 'FLG', permission: 'Admin', roles: ['rally-lead'], created_at: ts() },
    { id: '80472455', name: 'FrostByte', alliance_tag: 'FLG', permission: 'Team Maker', roles: ['potential-rally-lead', 'gather'], created_at: ts() },
    { id: '80471902', name: 'Snowclaw', alliance_tag: 'FLG', permission: 'Battle Strat', roles: ['joiner'], created_at: ts() },
    { id: '80473310', name: 'Glacia', alliance_tag: 'FLG', permission: 'Player Manager', roles: [], created_at: ts() },
    { id: '80469981', name: 'Blizzard', alliance_tag: 'WNT', permission: 'Players', roles: ['looter'], created_at: ts() },
    { id: '80470244', name: 'Permafrost', alliance_tag: 'WNT', permission: 'Players', roles: [], created_at: ts() },
    { id: '80468120', name: 'Thundrix', alliance_tag: 'TDR', permission: 'Battle Strat', roles: ['gather'], created_at: ts() },
  ];

  const accounts = [
    {
      key: 'icewarden',
      player_id: '80472391',
      name: '[FLG] ICEWARDEN',
      power: '142.8M',
      march: '250,000',
      furnace: 30,
      rally_lead: true,
      snow_ape_level: 1,
      troops: {
        infantry: { fc: 'FC1', tier: 'T11', skill: 0 },
        lancer: { fc: 'FC1', tier: 'T11', skill: 0 },
        marksman: { fc: 'FC1', tier: 'T11', skill: 0 },
      },
      rally: {
        rallyCap: '2,800,000',
        islandScore: '125,000',
        petPower: '0',
        expertPower: '0',
        techPower: '0',
        petLevels: freshPetLevels(),
        expert: { romulus: 1, fabian: 1, valeria: 1 },
        gear: { chiefMaxed: false, heroMaxed: false, maxSquad: 0 },
        charmLevels: freshCharmLevels(),
      },
      heroes: {},
      created_at: ts(),
      updated_at: ts(),
    },
    {
      key: 'frostbyte',
      player_id: '80472455',
      name: '[FLG] FROSTBYTE',
      power: '98.4M',
      march: '180,000',
      furnace: 25,
      rally_lead: true,
      snow_ape_level: 1,
      troops: {
        infantry: { fc: 'FC1', tier: 'T11', skill: 0 },
        lancer: { fc: 'FC1', tier: 'T11', skill: 0 },
        marksman: { fc: 'FC1', tier: 'T11', skill: 0 },
      },
      rally: {
        rallyCap: '1,200,000',
        islandScore: '64,000',
        petPower: '0',
        expertPower: '0',
        techPower: '0',
        petLevels: freshPetLevels(),
        expert: { romulus: 1, fabian: 1, valeria: 1 },
        gear: { chiefMaxed: false, heroMaxed: false, maxSquad: 0 },
        charmLevels: freshCharmLevels(),
      },
      heroes: {},
      created_at: ts(),
      updated_at: ts(),
    },
  ];

  const events = [
    { id: 'tal-event', tag: 'TAL', name: 'TAL Event', period: 'Ongoing', stage: 'Survey ongoing', status: 'unregistered', finished: false, created_at: ts() },
    { id: 'polar-hunt', tag: 'FDT', name: 'Polar Hunt', period: 'Jul 8', stage: 'Strategy meeting', status: 'registered', finished: false, created_at: ts() },
    { id: 'frozen-fort', tag: 'SVS', name: 'Frozen Fort', period: 'Jun 30', stage: 'Team sent', status: 'published', finished: false, created_at: ts() },
    { id: 'winter-siege', tag: 'SVS', name: 'Winter Siege', period: 'May 12 - May 19', stage: 'Team sent', status: 'published', finished: true, created_at: ts() },
  ];

  return { alliances, players, accounts, events };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseed
  }
  const initial = seedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

const state = loadState();
// Backfill for state persisted before the `roles` field existed.
state.players.forEach((p) => {
  if (!p.roles) p.roles = [];
});

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function byCreatedAt(a, b) {
  return a.created_at.localeCompare(b.created_at);
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function fetchAccounts() {
  return [...state.accounts].sort(byCreatedAt);
}

export async function insertAccount(account) {
  const now = new Date().toISOString();
  const row = { ...account, created_at: now, updated_at: now };
  state.accounts.push(row);
  persist();
  return row;
}

export async function updateAccount(key, patch) {
  const idx = state.accounts.findIndex((a) => a.key === key);
  if (idx === -1) throw new Error(`Account "${key}" not found.`);
  state.accounts[idx] = { ...state.accounts[idx], ...patch, updated_at: new Date().toISOString() };
  persist();
  return state.accounts[idx];
}

export async function deleteAccount(key) {
  state.accounts = state.accounts.filter((a) => a.key !== key);
  persist();
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function fetchPlayers() {
  return [...state.players].sort(byCreatedAt);
}

export async function updatePlayerPermission(id, permission) {
  const idx = state.players.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Player "${id}" not found.`);
  state.players[idx] = { ...state.players[idx], permission };
  persist();
  return state.players[idx];
}

export async function updatePlayerRoles(id, roles) {
  const idx = state.players.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Player "${id}" not found.`);
  state.players[idx] = { ...state.players[idx], roles };
  persist();
  return state.players[idx];
}

export async function deletePlayer(id) {
  state.players = state.players.filter((p) => p.id !== id);
  persist();
}

// ---------------------------------------------------------------------------
// Alliances
// ---------------------------------------------------------------------------

export async function fetchAlliances() {
  return [...state.alliances].sort(byCreatedAt);
}

export async function insertAlliance(tag, color) {
  const row = { tag, color, created_at: new Date().toISOString() };
  state.alliances.push(row);
  persist();
  return row;
}

export async function updateAllianceColor(tag, color) {
  const idx = state.alliances.findIndex((a) => a.tag === tag);
  if (idx === -1) throw new Error(`Alliance "${tag}" not found.`);
  state.alliances[idx] = { ...state.alliances[idx], color };
  persist();
  return state.alliances[idx];
}

export async function deleteAlliance(tag) {
  state.alliances = state.alliances.filter((a) => a.tag !== tag);
  persist();
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function fetchEvents() {
  return [...state.events].sort(byCreatedAt);
}

export async function insertEvent(event) {
  const row = { ...event, created_at: new Date().toISOString() };
  state.events.push(row);
  persist();
  return row;
}

export async function updateEvent(id, patch) {
  const idx = state.events.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Event "${id}" not found.`);
  state.events[idx] = { ...state.events[idx], ...patch };
  persist();
  return state.events[idx];
}

export async function deleteEvent(id) {
  state.events = state.events.filter((e) => e.id !== id);
  persist();
}
