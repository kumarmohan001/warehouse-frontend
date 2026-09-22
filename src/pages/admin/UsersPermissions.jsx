import React, { useEffect, useState } from 'react';
import { usersApi } from '../../features/users/usersApi';

const permissionOptions = [
  ['inventory:view', 'Inventory view'], ['inventory:manage', 'Inventory manage'],
  ['qc:view', 'QC view'], ['qc:manage', 'QC manage'],
  ['production:view', 'Production view'], ['production:manage', 'Production manage'],
  ['reports:view', 'Reports view'],
];
const emptyUser = { name: '', email: '', phone: '', password: '', role: 'warehouse', status: 'Active', permissions: [] };
const roleName = { warehouse: 'Warehouse', 'qc-test': 'QC Test', production: 'Production', admin: 'Admin' };

export default function UsersPermissions({ token }) {
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 });
  const [result, setResult] = useState({ users: [], pagination: { page: 1, total: 0, totalPages: 1 } });
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (showError = true) => {
    setLoading(true); if (showError) setError('');
    try {
      const data = await usersApi.list(token, filters);
      // Supports the paginated API response and prevents a broken list response
      // from making a successfully-created user look like a create failure.
      setResult({
        users: Array.isArray(data) ? data : data?.users || [],
        pagination: Array.isArray(data) ? { page: 1, total: data.length, totalPages: 1 } : data?.pagination || { page: 1, total: 0, totalPages: 1 },
      });
    }
    catch (requestError) { if (showError) setError(requestError.message || 'Unable to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [token, filters.page, filters.role, filters.status, filters.search]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  const updateForm = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const togglePermission = (permission) => setForm((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] }));

  async function saveUser(event) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    const payload = { ...form };
    if (editingId && !payload.password) delete payload.password;
    try {
      await (editingId ? usersApi.update(token, editingId, payload) : usersApi.create(token, payload));
      setToast(editingId ? 'User updated successfully.' : `${roleName[payload.role]} role is created successfully.`);
      setForm(emptyUser); setEditingId(null); setIsFormOpen(false);
      void loadUsers(false);
    } catch (requestError) {
      console.error('User create/update failed:', requestError);
      setError(requestError.message || 'Unable to save user.');
    }
    finally { setSaving(false); }
  }

  function editUser(user) {
    setEditingId(user._id); setMessage(''); setError('');
    setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', password: '', role: user.role || 'warehouse', status: user.status || 'Active', permissions: user.permissions || [] });
    setIsFormOpen(true);
  }

  function openCreateForm() { setEditingId(null); setForm(emptyUser); setError(''); setMessage(''); setIsFormOpen(true); }
  function closeForm() { if (!saving) { setEditingId(null); setForm(emptyUser); setIsFormOpen(false); } }

  const { users, pagination } = result;
  return <section className="user-management">
    {toast && <div className="success-toast" role="status">✓ {toast}</div>}
    <div className="page-title"><div><h1>Users & permissions</h1><p>Create users, assign roles and control workspace access.</p></div><button className="primary create-user-button" type="button" onClick={openCreateForm}>+ Create user</button></div>
    <div className="user-grid">
      <article className="users-card">
        <div className="card-heading"><div><h3>All users</h3><p>{pagination.total} total users · 7 per page</p></div></div>
        <div className="user-filters">
          <input aria-label="Search users" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search name or email" />
          <select aria-label="Filter by role" value={filters.role} onChange={(event) => updateFilter('role', event.target.value)}><option value="">All roles</option>{Object.entries(roleName).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="Filter by status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select>
        </div>
        {error && <p className="form-message error">{error}</p>}{message && <p className="form-message">{message}</p>}
        <div className="table-wrap"><table className="users-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Permissions</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="table-state">Loading users…</td></tr> : users.length ? users.map((user) => <tr key={user._id}><td><b>{user.name}</b><small>{user.email}</small></td><td><span className="badge">{roleName[user.role] || user.role}</span></td><td><span className={'status ' + user.status.toLowerCase()}>{user.status}</span></td><td>{user.permissions?.length || 0} assigned</td><td className="table-actions"><button className="text-button" onClick={() => editUser(user)}>Edit</button><button className="view-user-button" type="button" onClick={() => setViewingUser(user)} aria-label={`View ${user.name} details`} title="View user details">👁</button></td></tr>) : <tr><td colSpan="5" className="table-state">No users match these filters.</td></tr>}</tbody></table></div>
        <div className="pagination"><span>Page {pagination.page} of {pagination.totalPages}</span><div><button className="outline" disabled={loading || pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</button><button className="outline" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</button></div></div>
      </article>
    </div>
    {isFormOpen && <div className="user-modal-backdrop" role="presentation" onMouseDown={closeForm}>
      <form className="user-form user-modal" onSubmit={saveUser} onMouseDown={(event) => event.stopPropagation()}>
        <div className="card-heading"><h3>{editingId ? 'Edit user' : 'Create user'}</h3><button className="modal-close" type="button" onClick={closeForm} aria-label="Close">×</button></div>
        <div className="user-fields">
          <label>Full name<input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="User name" /></label>
          <label>Work email<input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="user@company.com" /></label>
          <label>Phone<input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="Optional" /></label>
          <label>{editingId ? 'New password (optional)' : 'Password'}<input required={!editingId} minLength="6" type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} placeholder="Minimum 6 characters" /></label>
          <label>Role<select value={form.role} onChange={(event) => updateForm('role', event.target.value)}>{Object.entries(roleName).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={(event) => updateForm('status', event.target.value)}><option>Active</option><option>Inactive</option></select></label>
        </div>
        <fieldset className="permission-list"><legend>Permissions</legend>{permissionOptions.map(([value, label]) => <label key={value}><input type="checkbox" checked={form.permissions.includes(value)} onChange={() => togglePermission(value)} />{label}</label>)}</fieldset>
        <button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create user'}</button>
      </form>
    </div>}
    {viewingUser && <div className="user-modal-backdrop" role="presentation" onMouseDown={() => setViewingUser(null)}>
      <article className="user-form user-modal user-details" onMouseDown={(event) => event.stopPropagation()}>
        <div className="card-heading"><div><h3>{viewingUser.name}</h3><p>User details</p></div><button className="modal-close" type="button" onClick={() => setViewingUser(null)} aria-label="Close">×</button></div>
        <dl><div><dt>Email</dt><dd>{viewingUser.email}</dd></div><div><dt>Phone</dt><dd>{viewingUser.phone || 'Not provided'}</dd></div><div><dt>Role</dt><dd>{roleName[viewingUser.role] || viewingUser.role}</dd></div><div><dt>Status</dt><dd><span className={'status ' + viewingUser.status.toLowerCase()}>{viewingUser.status}</span></dd></div></dl>
        <div className="detail-permissions"><h4>Assigned permissions</h4>{viewingUser.permissions?.length ? <ul>{viewingUser.permissions.map((permission) => <li key={permission}>{permissionOptions.find(([value]) => value === permission)?.[1] || permission}</li>)}</ul> : <p>No individual permissions assigned.</p>}</div>
      </article>
    </div>}
  </section>;
}
