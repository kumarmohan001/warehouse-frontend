import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../features/auth/authApi';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import Sidebar from '../components/Sidebar';
import RoleTabs from '../components/RoleTabs';
import { roleDashboards, roleLabel } from '../data/roleDashboards';
import { getRolePage } from '../routes/rolePages';
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return undefined;

    dashboardApi.adminOverview(session.token).then(setOverview).catch((error) => {
      if (error.code === 'SERVICE_UNAVAILABLE') setServiceUnavailable(true);
      else {
        setMessage(error.message || 'Unable to load dashboard data.');
        if (error.message?.includes('Session')) onLogout();
      }
    });
  }, [isAdmin, session.token, onLogout]);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', closeProfileMenu);
    return () => document.removeEventListener('mousedown', closeProfileMenu);
  }, []);

  async function logout() { try { await authApi.logout(session.token); } finally { onLogout(); } }
  const roleConfig = roleDashboards[selectedRole] || roleDashboards.warehouse;
  const ActivePage = getRolePage(selectedRole, activePage);
  const selectRole = (role) => { setSelectedRole(role); setActivePage('Dashboard'); };
  const openAccountPage = (page) => { setActivePage(page); setProfileMenuOpen(false); };

  if (serviceUnavailable) return <ServiceUnavailable onRetry={() => window.location.reload()} />;

  return <main className="reference-dashboard">
    {message && <p className="dashboard-toast" role="alert">{message}</p>}
    <header className="reference-header">
      <img className="company-logo" src="/protech-biopharma-logo.jpeg" alt="Protech Biopharma" />
      {isAdmin && <RoleTabs selectedRole={selectedRole} onChange={selectRole} />}
      <div className="header-actions">
        {isAdmin && <span className="all-roles">All roles visible</span>}
        <button className="notification-button" type="button" aria-label="Notifications" title="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
          <span className="notification-dot" aria-hidden="true" />
        </button>
        <div className="profile-menu" ref={profileMenuRef}>
          <button className="profile-mini" type="button" title="Account menu" aria-label="Open account menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>{user.name.charAt(0).toUpperCase()}</button>
          {profileMenuOpen && <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-user"><b>{user.name}</b><small>{user.email}</small></div>
            <button type="button" role="menuitem" onClick={() => openAccountPage('Edit Profile')}>Edit profile</button>
            <button type="button" role="menuitem" onClick={() => openAccountPage('Settings')}>Settings</button>
            <button className="profile-logout" type="button" role="menuitem" onClick={logout}>Logout</button>
          </div>}
        </div>
      </div>
    </header>
    <div className="dashboard">
      <Sidebar active={activePage} onChange={setActivePage} onLogout={logout} menuTitle={roleConfig.menuTitle} items={roleConfig.menu} />
      <section className="workspace">
        <header className="topbar"><div><h2>Welcome, <span>{user.name.split(' ')[0]}</span></h2><p>Signed in as {roleLabel(user.role)}</p></div></header>
        <div className="content">
          {ActivePage ? <ActivePage token={session.token} overview={overview} onNavigate={setActivePage} onBack={() => setActivePage('Dashboard')} /> : <ComingSoonPage role={roleConfig.label} page={activePage} onBack={() => setActivePage('Dashboard')} />}
        </div>
      </section>
    </div>
  </main>;
}
