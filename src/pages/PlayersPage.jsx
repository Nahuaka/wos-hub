import { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { permissionClass } from '../lib/utils';
import { ROLE_DEFS } from '../data/roleDefs';
import RoleMultiSelect from '../components/common/RoleMultiSelect';
import MultiSelectFilter from '../components/common/MultiSelectFilter';

const PERMISSION_LEVELS = ['Admin', 'Team Maker', 'Battle Strat', 'Player Manager', 'Players'];

const TRASH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export default function PlayersPage() {
  const { players, alliances, isCurrentUserAdmin, setPlayerPermission, setPlayerRoles, removePlayer } =
    useAppData();
  const [search, setSearch] = useState('');
  const [permFilter, setPermFilter] = useState([]);
  const [allianceFilter, setAllianceFilter] = useState([]);
  const [roleFilter, setRoleFilter] = useState([]);

  const allianceColor = (tag) => alliances.find((a) => a.tag === tag)?.color || 'var(--text-dimmer)';

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return players.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
      const matchesPerm = permFilter.length === 0 || permFilter.includes(p.permission);
      const matchesAlliance = allianceFilter.length === 0 || allianceFilter.includes(p.alliance_tag);
      const matchesRole = roleFilter.length === 0 || (p.roles || []).some((r) => roleFilter.includes(r));
      return matchesSearch && matchesPerm && matchesAlliance && matchesRole;
    });
  }, [players, search, permFilter, allianceFilter, roleFilter]);

  function handleRoleToggle(player, roleId) {
    const current = player.roles || [];
    const next = current.includes(roleId)
      ? current.filter((r) => r !== roleId)
      : [...current, roleId];
    setPlayerRoles(player.id, next);
  }

  function handleDelete(player) {
    if (window.confirm(`Remove ${player.name} from the registered players list?`)) {
      removePlayer(player.id);
    }
  }

  return (
    <div>
      <div className="section-title-row">
        <div className="section-title">PLAYERS</div>
        <div className="players-count">
          {filtered.length} of {players.length} registered
        </div>
      </div>

      <div className="card players-toolbar">
        <div className="players-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <MultiSelectFilter
          allLabel="All Permissions"
          options={PERMISSION_LEVELS.map((lvl) => ({ id: lvl, label: lvl }))}
          selected={permFilter}
          onChange={setPermFilter}
        />
        <MultiSelectFilter
          allLabel="All Alliances"
          options={alliances.map((a) => ({ id: a.tag, label: a.tag, dotColor: a.color }))}
          selected={allianceFilter}
          onChange={setAllianceFilter}
        />
        <MultiSelectFilter
          allLabel="All Roles"
          options={ROLE_DEFS.map((role) => ({ id: role.id, label: role.label, dotClassName: role.id }))}
          selected={roleFilter}
          onChange={setRoleFilter}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="players-table">
          <div className="players-table-head">
            <div>Name</div>
            <div>Alliance</div>
            <div>ID</div>
            <div>Permission</div>
            <div>Roles</div>
            <div className="col-action" />
          </div>
          <div>
            {filtered.length === 0 && (
              <div className="players-empty">No players match your search or filters.</div>
            )}
            {filtered.map((p) => (
              <div className="players-row" key={p.id}>
                <div className="p-name">{p.name}</div>
                <div className="p-alliance">
                  {p.alliance_tag && (
                    <span className="p-alliance-dot" style={{ background: allianceColor(p.alliance_tag) }} />
                  )}
                  {p.alliance_tag}
                </div>
                <div className="p-id">{p.id}</div>
                <div>
                  {isCurrentUserAdmin ? (
                    <select
                      className={`perm-select ${permissionClass(p.permission)}`}
                      value={p.permission}
                      onChange={(e) => setPlayerPermission(p.id, e.target.value)}
                    >
                      {PERMISSION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`perm-badge ${permissionClass(p.permission)}`}>{p.permission}</span>
                  )}
                </div>
                <RoleMultiSelect
                  roles={p.roles || []}
                  editable={isCurrentUserAdmin}
                  onToggle={(roleId) => handleRoleToggle(p, roleId)}
                />
                <div className="col-action">
                  <button className="btn-delete-icon" title="Remove player" onClick={() => handleDelete(p)}>
                    {TRASH_ICON}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
