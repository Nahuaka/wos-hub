import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="brand auth-brand">
          <div className="brand-icon" />
          <div className="brand-name">WOS HUB</div>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => setMode('register')}
          >
            Get Started
          </button>
        </div>
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}
