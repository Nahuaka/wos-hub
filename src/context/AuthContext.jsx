import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../lib/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still checking for an existing session, null = logged out.
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    authApi.getSession().then((s) => {
      if (!cancelled) setSession(s);
    });
    const unsubscribe = authApi.onAuthStateChange((s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (playerId, password) => {
    const { session: newSession } = await authApi.signIn(playerId, password);
    setSession(newSession);
  }, []);

  // Used by the registration form, which creates the player/account rows
  // itself right after this resolves - see RegisterForm.jsx. Deliberately
  // does NOT set `session` here: doing so would mount AppDataProvider (and
  // its players/accounts fetch) before the new rows are actually written,
  // racing the fetch against the insert. RegisterForm calls `login` once
  // its writes are done instead, so the session only flips (and the fetch
  // only fires) once there's something new to fetch.
  const register = useCallback(async (playerId, password) => {
    const { user } = await authApi.signUp(playerId, password);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.signOut();
    setSession(null);
  }, []);

  const value = {
    loading: session === undefined,
    session,
    currentAuthUserId: session?.user?.id ?? null,
    currentPlayerId: session?.user?.user_metadata?.player_id ?? null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
