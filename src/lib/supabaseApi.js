import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function fetchAccounts() {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function insertAccount(account) {
  const { data, error } = await supabase.from('accounts').insert(account).select().single();
  if (error) throw error;
  return data;
}

// `patch` is a partial row, e.g. { power: '150M' } or { rally: {...} }.
export async function updateAccount(key, patch) {
  const { data, error } = await supabase
    .from('accounts')
    .update(patch)
    .eq('key', key)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(key) {
  const { error } = await supabase.from('accounts').delete().eq('key', key);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function fetchPlayers() {
  const { data, error } = await supabase.from('players').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function updatePlayerPermission(id, permission) {
  const { data, error } = await supabase
    .from('players')
    .update({ permission })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayerRoles(id, roles) {
  const { data, error } = await supabase
    .from('players')
    .update({ roles })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Alliances
// ---------------------------------------------------------------------------

export async function fetchAlliances() {
  const { data, error } = await supabase.from('alliances').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function insertAlliance(tag, color) {
  const { data, error } = await supabase
    .from('alliances')
    .insert({ tag, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAllianceColor(tag, color) {
  const { data, error } = await supabase
    .from('alliances')
    .update({ color })
    .eq('tag', tag)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAlliance(tag) {
  const { error } = await supabase.from('alliances').delete().eq('tag', tag);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function fetchEvents() {
  const { data, error } = await supabase.from('events').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function insertEvent(event) {
  const { data, error } = await supabase.from('events').insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, patch) {
  const { data, error } = await supabase
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
