import { useNavigate } from 'react-router-dom';

export default function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <div className={`event-card${event.finished ? ' past' : ''}`} onClick={() => navigate(`/admin/events/${event.id}`)}>
      <div className="event-card-top">
        <span className="event-tag">{event.tag}</span>
        <span className={`event-status-dot status-${event.status}`} />
      </div>
      <div className="event-card-name">{event.name}</div>
      <div className="event-card-period">{event.period}</div>
      <div className="event-card-stage">{event.stage}</div>
    </div>
  );
}
