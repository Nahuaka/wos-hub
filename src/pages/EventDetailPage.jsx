import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const STATUS_LABELS = {
  unregistered: 'Unregistered',
  registered: 'Registered',
  published: 'Team Published',
};

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { events } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const event = events.find((e) => e.id === eventId);
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!event) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dimmer)' }}>
        Event not found.
      </div>
    );
  }

  return (
    <div>
      <div className="section-title-row">
        <button
          className="btn-secondary"
          onClick={() => navigate(isAdminRoute ? '/admin/events' : '/overview')}
        >
          &larr; {isAdminRoute ? 'Back to Events' : 'Back'}
        </button>
      </div>
      <div className="card event-detail-card">
        <div className="event-detail-tag-row">
          <span className="event-tag">{event.tag}</span>
          <span className={`event-status-dot status-${event.status}`} />
          <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontWeight: 700 }}>
            {STATUS_LABELS[event.status]}
          </span>
        </div>
        <div className="event-detail-name">{event.name}</div>
        <div className="event-detail-row">
          <span className="event-detail-label">PERIOD</span>
          <span className="event-detail-value">{event.period}</span>
        </div>
        <div className="event-detail-row">
          <span className="event-detail-label">STAGE</span>
          <span className="event-detail-value">{event.stage}</span>
        </div>
        <div className="event-detail-row">
          <span className="event-detail-label">STATUS</span>
          <span className="event-detail-value">{event.finished ? 'Finished' : 'Ongoing'}</span>
        </div>
      </div>
    </div>
  );
}
