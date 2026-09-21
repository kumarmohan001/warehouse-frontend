import React, { useEffect, useState } from 'react';
import { authApi, dashboardApi } from '../api/client';
import Sidebar from '../components/Sidebar';
import RoleTabs from '../components/RoleTabs';
import { roleDashboards, roleLabel } from '../data/roleDashboards';
import { getRolePage } from './rolePages';
import ComingSoonPage from './shared/ComingSoonPage';
import ServiceUnavailable from '../components/ServiceUnavailable';

export default function DashboardPage({ session, onLogout }) {
  const user = session.user;
  const isAdmin = user.role === 'admin';
  const [activePage, setActivePage] = useState('Dashboard');
  const [overview, setOverview] = useState(null);
  const [message, setMessage] = useState('');
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  useEffect(() => {
    dashboardApi.overview(session.token).then(setOverview).catch((error) => {
      if (error.code === 'SERVICE_UNAVAILABLE') setServiceUnavailable(true);
      else {
        setMessage(error.message || 'Unable to load dashboard data.');
        if (error.message?.includes('Session')) onLogout();
      }
    });
  }, [session.token, onLogout]);

  async function logout() { try { await authApi.logout(session.token); } finally { onLogout(); } }
  const roleConfig = roleDashboards[selectedRole] || roleDashboards.warehouse;
  const ActivePage = getRolePage(selectedRole, activePage);
  const selectRole = (role) => { setSelectedRole(role); setActivePage('Dashboard'); };

  if (serviceUnavailable) return <ServiceUnavailable onRetry={() => window.location.reload()} />;

  return <main className="reference-dashboard">
    <header className="reference-header">
      <img className="company-logo" src="/protech-biopharma-logo.jpeg" alt="Protech Biopharma" />
      {isAdmin && <RoleTabs selectedRole={selectedRole} onChange={selectRole} />}
      <div className="header-actions">{isAdmin && <span className="all-roles">All roles visible</span>}<button className="profile-mini" title="Account">{user.name.charAt(0).toUpperCase()}</button></div>
    </header>
    <div className="dashboard">
      <Sidebar active={activePage} onChange={setActivePage} onLogout={logout} menuTitle={roleConfig.menuTitle} items={roleConfig.menu} />
      <section className="workspace">
        <header className="topbar"><div><h2>Welcome, <span>{user.name.split(' ')[0]}</span></h2><p>Signed in as {roleLabel(user.role)}</p></div><div className="profile"><span>{user.name.charAt(0).toUpperCase()}</span><div><b>{user.name}</b><small>{isAdmin ? 'Administrator' : roleLabel(user.role)}</small></div></div></header>
        <div className="content">
          {message && <p className="form-message error">{message}</p>}
          {ActivePage ? <ActivePage overview={overview} onNavigate={setActivePage} onBack={() => setActivePage('Dashboard')} /> : <ComingSoonPage role={roleConfig.label} page={activePage} onBack={() => setActivePage('Dashboard')} />}
        </div>
      </section>
    </div>
  </main>;
}
