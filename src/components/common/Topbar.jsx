import { NavLink } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';

export default function Topbar() {
  const { currentAccount } = useAppData();
  const rallyLeadOn = currentAccount ? currentAccount.rally_lead !== false : true;

  return (
    <div className="topbar">
      <div className="tabs">
        <NavLink to="/overview" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          OVERVIEW
        </NavLink>
        {rallyLeadOn && (
          <NavLink to="/rally-lead" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            RALLY LEAD
          </NavLink>
        )}
        <NavLink to="/heroes" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          HEROES
        </NavLink>
        <NavLink to="/event-history" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          EVENT HISTORY
        </NavLink>
      </div>
      <div className="season-badge">
        <span className="dot" /> S 1518
      </div>
    </div>
  );
}
