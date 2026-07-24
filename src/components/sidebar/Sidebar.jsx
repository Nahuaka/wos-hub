import { useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import AccountRow from './AccountRow';
import SidebarEventRow from './SidebarEventRow';
import AddAccountModal from './AddAccountModal';

const PLAYERS_ICON = (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EVENTS_ICON = (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const TRASH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

const SETTINGS_ICON = (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function Sidebar() {
  const { myAccounts, currentAccountKey, setCurrentAccountKey, removeAccount, events } = useAppData();
  const { logout } = useAuth();
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { account, x, y } | null
  const contextMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useClickOutside(contextMenuRef, !!contextMenu, () => setContextMenu(null));

  // Admin pages (Players, Event Management, Settings) are their own
  // distinct views - an account row shouldn't show as "active" alongside
  // them, since no account is actually being viewed there.
  const onAdminPage = location.pathname.startsWith('/admin');
  const ongoingEvents = events.filter((e) => !e.finished);

  function handleAccountSelect(key) {
    setCurrentAccountKey(key);
    if (onAdminPage) {
      navigate('/overview');
    }
  }

  function handleAccountContextMenu(e, account) {
    e.preventDefault();
    setContextMenu({ account, x: e.clientX, y: e.clientY });
  }

  function handleDeleteAccount() {
    if (!contextMenu) return;
    const { account } = contextMenu;
    setContextMenu(null);
    if (window.confirm(`Delete ${account.name}? This can't be undone.`)) {
      removeAccount(account.key);
    }
  }

  function handleEventClick(eventId) {
    // Opens the event detail via a route outside /admin - that section is
    // admin-only, and a regular player following their event notification
    // shouldn't land on a URL that lights up the admin nav.
    navigate(`/events/${eventId}`);
  }

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon" />
        <div className="brand-name">WOS HUB</div>
      </div>

      <div className="section-label">ACCOUNTS</div>
      <div id="accountsList">
        {myAccounts.map((account) => (
          <AccountRow
            key={account.key}
            account={account}
            active={!onAdminPage && account.key === currentAccountKey}
            onSelect={handleAccountSelect}
            onContextMenu={handleAccountContextMenu}
          />
        ))}
      </div>
      <div className="add-alt" onClick={() => setAddAccountOpen(true)}>
        <span>+</span>
        <span>Add Alt</span>
      </div>

      <div className="section-label">EVENTS</div>
      <div id="sidebarEventsList">
        {ongoingEvents.length === 0 && (
          <div className="event-sub" style={{ padding: '6px 10px' }}>
            No ongoing events
          </div>
        )}
        {ongoingEvents.map((event) => (
          <SidebarEventRow key={event.id} event={event} onClick={handleEventClick} />
        ))}
      </div>

      <div className="section-label">ADMIN</div>
      <NavLink to="/admin/players" className={({ isActive }) => `admin-row${isActive ? ' active' : ''}`}>
        {PLAYERS_ICON}
        Players
      </NavLink>
      <NavLink to="/admin/events" className={({ isActive }) => `admin-row${isActive ? ' active' : ''}`}>
        {EVENTS_ICON}
        Event Management
      </NavLink>
      <NavLink to="/admin/settings" className={({ isActive }) => `admin-row${isActive ? ' active' : ''}`}>
        {SETTINGS_ICON}
        Settings
      </NavLink>

      <div className="sidebar-footer">
        <div className="logout" onClick={logout}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Log out
        </div>
      </div>

      <AddAccountModal open={addAccountOpen} onClose={() => setAddAccountOpen(false)} />

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button type="button" className="context-menu-item danger" onClick={handleDeleteAccount}>
            {TRASH_ICON}
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
