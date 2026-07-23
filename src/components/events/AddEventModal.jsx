import { useState } from 'react';
import Modal from '../common/Modal';
import { useAppData } from '../../context/AppDataContext';

const TAGS = ['SVS', 'TAL', 'FDT'];
const STATUSES = [
  { value: 'unregistered', label: 'Unregistered' },
  { value: 'registered', label: 'Registered' },
  { value: 'published', label: 'Team Published' },
];
const STAGES = ['Survey ongoing', 'Strategy meeting', 'Team creation', 'Team sent'];

export default function AddEventModal({ open, onClose }) {
  const { addEvent } = useAppData();
  const [tag, setTag] = useState('SVS');
  const [status, setStatus] = useState('unregistered');
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [stage, setStage] = useState('Survey ongoing');
  const [nameError, setNameError] = useState(false);

  function resetForm() {
    setTag('SVS');
    setStatus('unregistered');
    setName('');
    setPeriod('');
    setStage('Survey ongoing');
    setNameError(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    await addEvent({
      tag,
      name: name.trim(),
      period: period.trim() || 'TBD',
      stage,
      status,
    });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Event"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Create Event
          </button>
        </>
      }
    >
      <div className="field-row">
        <div className="field">
          <label>Tag</label>
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Event Name</label>
        <input
          type="text"
          className={nameError ? 'field-error' : ''}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Frozen Fort"
        />
      </div>
      <div className="field">
        <label>Date / Period</label>
        <input
          type="text"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="e.g. Jul 8 or Jul 8 - Jul 12"
        />
      </div>
      <div className="field">
        <label>Stage</label>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}
