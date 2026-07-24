import { supabase } from './supabaseClient';
import { toSyntheticEmail } from './utils';

export async function signUp(playerId, password) {
  const { data, error } = await supabase.auth.signUp({
    email: toSyntheticEmail(playerId),
    password,
    options: { data: { player_id: playerId } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(playerId, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toSyntheticEmail(playerId),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => subscription.unsubscribe();
}
