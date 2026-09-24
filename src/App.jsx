import React, { useCallback, useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function readSession() {
  try { return JSON.parse(localStorage.getItem('protechSession')) || null; } catch { return null; }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const logout = useCallback(() => { localStorage.removeItem('protechSession'); setSession(null); }, []);
  const updateUser = useCallback((user) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      localStorage.setItem('protechSession', JSON.stringify(next));
      return next;
    });
  }, []);
  return session?.token ? <DashboardPage onProfileUpdate={updateUser} session={session} onLogout={logout} /> : <AuthPage onLogin={setSession} />;
}
