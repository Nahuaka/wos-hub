import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';
import { slugify, eventSlug } from '../lib/utils';
import { freshTroopState } from '../data/troopDefs';
import { freshRallyState } from '../data/rallyDefs';
import { freshHeroState } from '../data/heroRoster';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [currentAccountKey, setCurrentAccountKey] = useState(null);
  const [players, setPlayers] = useState([]);
  const [alliances, setAlliances] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const [accountsData, playersData, alliancesData, eventsData] = await Promise.all([
          api.fetchAccounts(),
          api.fetchPlayers(),
          api.fetchAlliances(),
          api.fetchEvents(),
        ]);
        if (cancelled) return;
        setAccounts(accountsData);
        setPlayers(playersData);
        setAlliances(alliancesData);
        setEvents(eventsData);
        if (accountsData.length > 0) {
          setCurrentAccountKey(accountsData[0].key);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentAccount = useMemo(
    () => accounts.find((a) => a.key === currentAccountKey) || null,
    [accounts, currentAccountKey]
  );

  const isCurrentUserAdmin = useMemo(() => {
    if (!currentAccount) return false;
    const me = players.find((p) => p.id === currentAccount.player_id);
    return !!me && me.permission === 'Admin';
  }, [players, currentAccount]);

  // Generic patch merger: updates local state immediately, then persists to
  // Supabase in the background.
  const patchAccount = useCallback((key, patch) => {
    setAccounts((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));
    api.updateAccount(key, patch).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save account change:', err);
    });
  }, []);

  const patchCurrentAccount = useCallback(
    (patch) => {
      if (!currentAccountKey) return;
      patchAccount(currentAccountKey, patch);
    },
    [currentAccountKey, patchAccount]
  );

  // Merge a partial update into one of the JSONB sub-objects (rally, troops,
  // heroes) of the current account, then persist the whole merged object.
  const patchCurrentAccountJson = useCallback(
    (field, updater) => {
      if (!currentAccountKey) return;
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.key !== currentAccountKey) return a;
          const nextField = updater(a[field] || {});
          const nextAccount = { ...a, [field]: nextField };
          api.updateAccount(currentAccountKey, { [field]: nextField }).catch((err) => {
            // eslint-disable-next-line no-console
            console.error(`Failed to save ${field} change:`, err);
          });
          return nextAccount;
        })
      );
    },
    [currentAccountKey]
  );

  const createAccount = useCallback(
    async ({ name, playerId, power, march, troops }) => {
      const key = slugify(name, accounts.map((a) => a.key));
      const newAccount = {
        key,
        player_id: playerId || null,
        name,
        power: power || '0',
        march: march || '0',
        furnace: 1,
        rally_lead: true,
        snow_ape_level: 1,
        troops: troops || freshTroopState(),
        rally: freshRallyState(),
        heroes: freshHeroState(),
      };
      const saved = await api.insertAccount(newAccount);
      setAccounts((prev) => [...prev, saved]);
      setCurrentAccountKey(saved.key);
      return saved;
    },
    [accounts]
  );

  // ---- Players ----
  const setPlayerPermission = useCallback((id, permission) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, permission } : p)));
    api.updatePlayerPermission(id, permission).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update player permission:', err);
    });
  }, []);

  const setPlayerRoles = useCallback((id, roles) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, roles } : p)));
    api.updatePlayerRoles(id, roles).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update player roles:', err);
    });
  }, []);

  const removePlayer = useCallback((id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    api.deletePlayer(id).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete player:', err);
    });
  }, []);

  // ---- Alliances ----
  const addAlliance = useCallback(
    async (tag, color) => {
      if (alliances.some((a) => a.tag === tag)) {
        throw new Error(`Alliance "${tag}" already exists.`);
      }
      const saved = await api.insertAlliance(tag, color);
      setAlliances((prev) => [...prev, saved]);
      return saved;
    },
    [alliances]
  );

  const setAllianceColor = useCallback((tag, color) => {
    setAlliances((prev) => prev.map((a) => (a.tag === tag ? { ...a, color } : a)));
    api.updateAllianceColor(tag, color).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update alliance color:', err);
    });
  }, []);

  const removeAlliance = useCallback((tag) => {
    setAlliances((prev) => prev.filter((a) => a.tag !== tag));
    api.deleteAlliance(tag).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete alliance:', err);
    });
  }, []);

  // ---- Events ----
  const addEvent = useCallback(
    async ({ tag, name, period, stage, status }) => {
      const id = eventSlug(name, events.map((e) => e.id));
      const saved = await api.insertEvent({ id, tag, name, period, stage, status, finished: false });
      setEvents((prev) => [...prev, saved]);
      return saved;
    },
    [events]
  );

  const patchEvent = useCallback((id, patch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    api.updateEvent(id, patch).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update event:', err);
    });
  }, []);

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    api.deleteEvent(id).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete event:', err);
    });
  }, []);

  const value = {
    loading,
    error,
    accounts,
    currentAccount,
    currentAccountKey,
    setCurrentAccountKey,
    isCurrentUserAdmin,
    patchAccount,
    patchCurrentAccount,
    patchCurrentAccountJson,
    createAccount,
    players,
    setPlayerPermission,
    setPlayerRoles,
    removePlayer,
    alliances,
    addAlliance,
    setAllianceColor,
    removeAlliance,
    events,
    addEvent,
    patchEvent,
    removeEvent,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
