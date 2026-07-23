export default function SidebarEventRow({ event, onClick }) {
  return (
    <div className={`event-row status-${event.status}`} onClick={() => onClick(event.id)}>
      <div className="event-dot" />
      <div>
        <div className="event-name">{event.name}</div>
        <div className="event-sub">{event.stage}</div>
      </div>
    </div>
  );
}
