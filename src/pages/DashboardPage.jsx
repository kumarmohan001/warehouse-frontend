import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/httpClient';
import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../features/auth/authApi';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import Sidebar from '../components/Sidebar';
import RoleAccounts from './admin/RoleAccounts';
import RoleTabs from '../components/RoleTabs';
import { roleDashboards, roleLabel } from '../data/roleDashboards';
import { getRolePage } from '../routes/rolePages';
import ComingSoonPage from './shared/ComingSoonPage';
import ServiceUnavailable from '../components/ServiceUnavailable';
import { warehouseApi } from '../features/warehouse/warehouseApi';

export default function DashboardPage({ session, onLogout, onProfileUpdate }) {
  const user = session.user;
  const isAdmin = user.role === 'admin';
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [overview, setOverview] = useState(null);
  const [message, setMessage] = useState('');
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const readNotificationIds = useRef(new Set());

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
    let active = true;
    readNotificationIds.current = new Set();
    setNotifications([]);
    const loadNotifications = () => warehouseApi.notifications(session.token).then((data) => {
      if (active) setNotifications((data.notifications || []).filter((item) => !item.read && !readNotificationIds.current.has(item._id)));
    }).catch(() => {});
    const socket = io(API_BASE_URL || window.location.origin, { auth: { token: session.token } });
    socket.on('connect', loadNotifications);
    socket.on('notification:new', (notification) => {
      if (notification.read || readNotificationIds.current.has(notification._id)) return;
      setNotifications((current) => [notification, ...current.filter((item) => item._id !== notification._id)].slice(0, 20));
    });
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => { active = false; window.clearInterval(interval); socket.disconnect(); };
  }, [session.token]);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', closeProfileMenu);
    return () => document.removeEventListener('mousedown', closeProfileMenu);
  }, []);

  function openNotification(notification) {
    const id = notification.materialReceiving?._id || notification.materialReceiving || notification.workflowRecord?._id || notification.workflowRecord;
    if (!id) { setMessage('This receipt is no longer available.'); return; }
    const targetRole = notification.targetRole || 'qc-test';
    if (isAdmin) setSelectedRole(targetRole);
    setSelectedReceiptId(id);
    const legacySampling = !notification.targetPage && targetRole === 'qc-test' && notification.materialReceiving?.status === 'Quarantine';
    setActivePage(notification.targetPage || (legacySampling ? 'Sampling' : 'Receiving Stock'));
    setNotificationsOpen(false);
    warehouseApi.markRead(session.token, notification._id).then(() => {
      readNotificationIds.current.add(notification._id);
      setNotifications((current) => current.filter((item) => item._id !== notification._id));
    }).catch((error) => setMessage(error.message));
  }

  async function logout() { try { await authApi.logout(session.token); } finally { onLogout(); } }
  const roleConfig = roleDashboards[selectedRole] || roleDashboards.warehouse;
  const ActivePage = getRolePage(selectedRole, activePage);
  const selectRole = (role) => { setSelectedRole(role); setSelectedAccount(null); setSelectedReceiptId(null); setActivePage('Dashboard'); };
  const openAccountPage = (page) => { setActivePage(page); setProfileMenuOpen(false); };

  if (serviceUnavailable) return <ServiceUnavailable onRetry={() => window.location.reload()} />;

  return <main className="reference-dashboard">
    {message && <p className="dashboard-toast" role="alert">{message}</p>}
    <header className="reference-header">
      <img className="company-logo" src="/protech-biopharma-logo.jpeg" alt="Protech Biopharma" />
      {isAdmin && <RoleTabs selectedRole={selectedRole} onChange={selectRole} />}
      <div className="header-actions">
        {isAdmin && <span className="all-roles">All roles visible</span>}
        <div className="notification-menu"><button className="notification-button" type="button" aria-label="Notifications" title="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
          {notifications.some((notification) => !notification.read) && <span className="notification-dot" aria-hidden="true" />}
        </button>{notificationsOpen && <div className="notification-dropdown"><b>Notifications</b>{notifications.length ? notifications.map((notification) => <button type="button" className="notification-item notification-unread" key={notification._id} onClick={() => openNotification(notification)}><strong>{notification.title}</strong><span>{notification.message}</span></button>) : <p>No unread notifications.</p>}</div>}</div>
        <div className="profile-menu" ref={profileMenuRef}>
          <button className="profile-mini" type="button" title="Account menu" aria-label="Open account menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>{user.photoUrl ? <img className="profile-avatar" src={user.photoUrl} alt="Your profile" /> : user.name.charAt(0).toUpperCase()}</button>
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
      <Sidebar active={activePage} onChange={(page) => { setSelectedReceiptId(null); setActivePage(page); }} onLogout={logout} menuTitle={roleConfig.menuTitle} items={roleConfig.menu} />
      <section className="workspace">
        <header className="topbar"><div><h2>Welcome, <span>{user.name.split(' ')[0]}</span></h2><p>Signed in as {roleLabel(user.role)}</p></div></header>
        <div className="content">
          {!isAdmin && activePage === 'Dashboard' ? <RoleAccounts key={user._id || user.id} token={session.token} role={user.role} account={user} self onNavigate={setActivePage} /> : isAdmin && selectedRole !== 'admin' && activePage === 'Dashboard' ? <RoleAccounts key={`${selectedRole}:${selectedAccount?._id || 'list'}`} token={session.token} role={selectedRole} account={selectedAccount} onSelect={setSelectedAccount} /> : ActivePage ? <ActivePage onProfileUpdate={onProfileUpdate} onLogout={onLogout} user={user} selectedReceiptId={selectedReceiptId} onCloseReceipt={() => setSelectedReceiptId(null)} token={session.token} overview={overview} onNavigate={(page) => { setSelectedReceiptId(null); setActivePage(page); }} onBack={() => setActivePage('Dashboard')} /> : <ComingSoonPage role={roleConfig.label} page={activePage} onBack={() => setActivePage('Dashboard')} />}
        </div>
      </section>
    </div>
  </main>;
}


