// Switches between the Supabase-backed auth and a localStorage-backed one,
// mirroring the api.js/localApi.js/supabaseApi.js split (same env flag).
import * as local from './localAuthApi';
import * as remote from './supabaseAuthApi';

const impl = import.meta.env.VITE_USE_LOCAL_DATA === 'true' ? local : remote;

export const { signUp, signIn, signOut, getSession, onAuthStateChange } = impl;
