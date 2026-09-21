import React, { useCallback, useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function readSession() {
  try { return JSON.parse(localStorage.getItem('protechSession')) || null; } catch { return null; }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const logout = useCallback(() => { localStorage.removeItem('protechSession'); setSession(null); }, []);
  return session?.token ? <DashboardPage session={session} onLogout={logout} /> : <AuthPage onLogin={setSession} />;
}
