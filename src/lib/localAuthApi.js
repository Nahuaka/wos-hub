// localStorage-backed mock of supabaseAuthApi.js's interface, so the whole
// login/registration flow is testable without real Supabase credentials.
// Separate storage keys from localApi.js's data store - this only holds
// login identities, not player/account data.
import { toSyntheticEmail } from './utils';

const USERS_KEY = 'wos-hub-local-auth-users';
const SESSION_KEY = 'wos-hub-local-auth-session';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSessionEmail(email) {
  if (email) localStorage.setItem(SESSION_KEY, email);
  else localStorage.removeItem(SESSION_KEY);
}

export async function signUp(playerId, password) {
  const email = toSyntheticEmail(playerId);
  const users = loadUsers();
  if (users[email]) throw new Error('An account with this player ID already exists.');
  const user = { id: crypto.randomUUID(), email, password, user_metadata: { player_id: playerId } };
  users[email] = user;
  saveUsers(users);
  saveSessionEmail(email);
  return { user, session: { user } };
}

export async function signIn(playerId, password) {
  const email = toSyntheticEmail(playerId);
  const users = loadUsers();
  const user = users[email];
  if (!user || user.password !== password) throw new Error('Invalid player ID or password.');
  saveSessionEmail(email);
  return { user, session: { user } };
}

export async function signOut() {
  saveSessionEmail(null);
}

export async function getSession() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const user = loadUsers()[email];
  return user ? { user } : null;
}

export function onAuthStateChange() {
  // Local dev only - no other tabs/clients to sync with.
  return () => {};
}
