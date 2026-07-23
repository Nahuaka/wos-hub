import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import EventCard from '../components/events/EventCard';
import AddEventModal from '../components/events/AddEventModal';

export default function EventManagementPage() {
  const { events } = useAppData();
  const [addOpen, setAddOpen] = useState(false);

  const ongoing = events.filter((e) => !e.finished);
  const past = events.filter((e) => e.finished);

  return (
    <div>
      <div className="section-title-row">
        <div className="section-title">EVENT MANAGEMENT</div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          + Add Event
        </button>
      </div>
      <div className="event-card-grid">
        {ongoing.length === 0 && (
          <div className="players-empty">No ongoing events. Click "+ Add Event" to create one.</div>
        )}
        {ongoing.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>

      <div className="section-title-row" style={{ marginTop: 32 }}>
        <div className="section-title">PAST EVENTS</div>
      </div>
      <div className="event-card-grid">
        {past.length === 0 && <div className="players-empty">No past events yet.</div>}
        {past.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
