import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';
import * as authApi from '../lib/authApi';
import { slugify, eventSlug } from '../lib/utils';
import { freshTroopState } from '../data/troopDefs';
import { freshRallyState } from '../data/rallyDefs';
import { freshHeroState } from '../data/heroRoster';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

// A player's own root: the ID they first registered/claimed with, if this
// one was added later as an alt (owner_player_id set), otherwise itself.
function ownerRootOf(player) {
  return player ? player.owner_player_id || player.id : null;
}

export function AppDataProvider({ children }) {
  const { currentAuthUserId } = useAuth();
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
        // Default to one of my own accounts, not just whichever account
        // happens to be first overall.
        const myPlayerAtLoad = playersData.find((p) => p.auth_user_id === currentAuthUserId);
        const myRootAtLoad = ownerRootOf(myPlayerAtLoad);
        const myFirstAccount = accountsData.find((a) => {
          const p = playersData.find((pp) => pp.id === a.player_id);
          return p && ownerRootOf(p) === myRootAtLoad;
        });
        setCurrentAccountKey((myFirstAccount || accountsData[0])?.key ?? null);
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
  }, [currentAuthUserId]);

  const currentAccount = useMemo(
    () => accounts.find((a) => a.key === currentAccountKey) || null,
    [accounts, currentAccountKey]
  );

  const myOwnerRoot = useMemo(() => {
    const myPlayer = players.find((p) => p.auth_user_id === currentAuthUserId);
    return ownerRootOf(myPlayer);
  }, [players, currentAuthUserId]);

  // The sidebar only shows accounts belonging to the logged-in player's own
  // group of IDs (see owner_player_id), not every account in the alliance.
  const myAccounts = useMemo(
    () =>
      accounts.filter((a) => {
        const p = players.find((pp) => pp.id === a.player_id);
        return p && ownerRootOf(p) === myOwnerRoot;
      }),
    [accounts, players, myOwnerRoot]
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

  // Adding an alt with a player ID claims it under the current login. Each
  // player ID authenticates via its own synthetic email (see utils.js), so
  // "claiming" one means giving it a real signup of its own - not just
  // copying the current session's auth_user_id, which would leave that ID
  // with no way to actually sign in later. `password` is a fresh
  // confirmation from the user (not the one they logged in with, which we
  // never keep around) used only for this new signup; every claimed ID
  // ends up with the same password by construction. Whoever calls this is
  // expected to have already blocked IDs that are linked to someone else.
  const createAccount = useCallback(
    async ({ name, playerId, power, march, troops, existingAccountKey, password }) => {
      const resolvedPlayerId = playerId || null;
      if (resolvedPlayerId) {
        const existingPlayer = players.find((p) => p.id === resolvedPlayerId);
        if (!existingPlayer) {
          const { user } = await authApi.signUp(resolvedPlayerId, password);
          const newPlayer = await api.insertPlayer({
            id: resolvedPlayerId,
            name,
            alliance_tag: null,
            permission: 'Players',
            roles: [],
            auth_user_id: user.id,
            // Group this new alt under my own root ID, so it shows up in
            // my sidebar and I can add further alts starting from it too.
            owner_player_id: myOwnerRoot,
          });
          setPlayers((prev) => [...prev, newPlayer]);
        } else if (!existingPlayer.auth_user_id) {
          const { user } = await authApi.signUp(resolvedPlayerId, password);
          const linked = await api.linkPlayerAuthUser(resolvedPlayerId, user.id, myOwnerRoot);
          setPlayers((prev) => prev.map((p) => (p.id === resolvedPlayerId ? linked : p)));
        }
      }

      if (existingAccountKey) {
        const patch = { name, power: power || '0', march: march || '0', troops: troops || freshTroopState() };
        setAccounts((prev) => prev.map((a) => (a.key === existingAccountKey ? { ...a, ...patch } : a)));
        const saved = await api.updateAccount(existingAccountKey, patch);
        setAccounts((prev) => prev.map((a) => (a.key === existingAccountKey ? saved : a)));
        setCurrentAccountKey(saved.key);
        return saved;
      }

      const key = slugify(name, accounts.map((a) => a.key));
      const newAccount = {
        key,
        player_id: resolvedPlayerId,
        name,
        power: power || '0',
        march: march || '0',
        furnace: '1',
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
    [accounts, players, myOwnerRoot]
  );

  const removeAccount = useCallback(
    (key) => {
      setAccounts((prev) => {
        const next = prev.filter((a) => a.key !== key);
        if (currentAccountKey === key) {
          const fallback = next.find((a) => {
            const p = players.find((pp) => pp.id === a.player_id);
            return p && ownerRootOf(p) === myOwnerRoot;
          });
          setCurrentAccountKey(fallback ? fallback.key : null);
        }
        return next;
      });
      api.deleteAccount(key).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to delete account:', err);
      });
    },
    [currentAccountKey, players, myOwnerRoot]
  );

  // Admin-only "Add Player" - a bare, unclaimed record (no auth_user_id).
  const addPlayer = useCallback(async ({ id, name, allianceTag, permission }) => {
    const saved = await api.insertPlayer({
      id,
      name,
      alliance_tag: allianceTag || null,
      permission: permission || 'Players',
      roles: [],
      auth_user_id: null,
    });
    setPlayers((prev) => [...prev, saved]);
    return saved;
  }, []);

  // ---- Players ----
  const setPlayerAlliance = useCallback((id, allianceTag) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, alliance_tag: allianceTag || null } : p)));
    api.updatePlayerInfo(id, { alliance_tag: allianceTag || null }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update player alliance:', err);
    });
  }, []);

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
    myAccounts,
    myOwnerRoot,
    currentAccount,
    currentAccountKey,
    setCurrentAccountKey,
    isCurrentUserAdmin,
    patchAccount,
    patchCurrentAccount,
    patchCurrentAccountJson,
    createAccount,
    removeAccount,
    players,
    setPlayerAlliance,
    setPlayerPermission,
    setPlayerRoles,
    addPlayer,
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
