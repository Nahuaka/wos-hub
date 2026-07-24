import { initialOf } from '../../lib/utils';

export default function AccountRow({ account, active, onSelect, onContextMenu }) {
  return (
    <div
      className={`account-row${active ? ' active' : ''}`}
      onClick={() => onSelect(account.key)}
      onContextMenu={onContextMenu ? (e) => onContextMenu(e, account) : undefined}
    >
      <div className="avatar-circle">{initialOf(account.name)}</div>
      <div className="account-meta">
        <div className="name">{account.name}</div>
        <div className="sub">F{account.furnace}</div>
      </div>
    </div>
  );
}
