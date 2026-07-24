import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!playerId.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      await login(playerId.trim(), password);
    } catch {
      setError('Invalid player ID or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="modal-body" onSubmit={handleSubmit}>
      <div className="field">
        <label>Player ID</label>
        <input
          type="text"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="e.g. 80472391"
          autoFocus
        />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <div className="field-hint error">{error}</div>}
      <button className="btn-primary auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Logging in…' : 'Log In'}
      </button>
      <div className="auth-switch">
        New here?{' '}
        <button type="button" className="link-button" onClick={onSwitchToRegister}>
          Get started
        </button>
      </div>
    </form>
  );
}
