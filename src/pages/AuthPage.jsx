import React, { useState } from 'react';
import { authApi } from '../features/auth/authApi';
import Brand from '../components/Brand';
import AuthForm from '../components/AuthForm';
import ServiceUnavailable from '../components/ServiceUnavailable';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  async function submit(data, clientError) {
    if (clientError) { setIsError(true); setMessage(clientError); return; }
    setLoading(true); setMessage('');
    try {
      if (mode === 'signup') {
        await authApi.signup(data);
        setMode('login'); setIsError(false); setMessage('Account created. Please sign in.');
      } else {
        const session = await authApi.login(data);
        localStorage.setItem('protechSession', JSON.stringify(session));
        onLogin(session);
      }
    } catch (error) {
      if (error.code === 'SERVICE_UNAVAILABLE') setServiceUnavailable(true);
      else { setIsError(true); setMessage(error.message); }
    } finally { setLoading(false); }
  }

  if (serviceUnavailable) return <ServiceUnavailable onRetry={() => { setServiceUnavailable(false); setMessage(''); }} />;

  return <main className="auth-shell">
    <section className="brand-panel"><Brand /><div className="brand-copy"><p className="eyebrow">WAREHOUSE CONTROL SYSTEM</p><h1>Every batch, in safe hands.</h1><p>Manage pharmaceutical inventory with clarity, traceability, and confidence.</p></div><div className="brand-footer">Dedicated to healthy life <span>•</span> Secure workspace</div></section>
    <section className="auth-panel"><AuthForm mode={mode} onSubmit={submit} message={message} isError={isError} loading={loading} onModeChange={(nextMode) => { setMode(nextMode); setMessage(''); setIsError(false); }} /></section>
  </main>;
}
