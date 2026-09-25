import React, { useEffect, useState } from 'react';
import { usersApi } from '../../features/users/usersApi';
import { dashboardApi } from '../../features/dashboard/dashboardApi';
import { roleLabel } from '../../data/roleDashboards';
import DashboardStats from '../shared/dashboard/DashboardStats';
import './role-accounts.css';

function AccountAvatar({ photoUrl }) {
  const [failed, setFailed] = useState(false);
  return <span className="account-avatar" aria-hidden="true">{photoUrl && !failed
    ? <img src={photoUrl} alt="" onError={() => setFailed(true)} />
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>}</span>;
}

export default function RoleAccounts({ token, role, account, onSelect, self = false, onNavigate }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setResult(null);
    const request = self ? dashboardApi.mine(token) : account ? dashboardApi.account(token, account._id) : usersApi.list(token, { role, page, search });
    request.then((data) => { if (active) setResult(data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, role, account, page, search, refresh, self]);
  const label = roleLabel(role);
  if (!account) return <section className="account-directory" aria-label={`${label} accounts`}>
    <header className="account-directory-heading">
      <div><span className="account-eyebrow">ADMIN / {label.toUpperCase()}</span><h1>{label} accounts</h1><p>Choose an account to explore its dashboard and latest records.</p></div>
      <span className="account-role-tag">{label} workspace</span>
    </header>
    <div className="account-directory-panel">
      <div className="account-toolbar">
        <div className="account-list-title"><h2>All accounts</h2>{result && <span>{result.pagination.total}</span>}</div>
        <div className="account-tools">
          <label className="account-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input type="search" aria-label="Search accounts" placeholder="Search name or email..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
          <button type="button" className="account-refresh" disabled={loading} onClick={() => setRefresh((value) => value + 1)}>Refresh</button>
        </div>
      </div>
      {error && <div className="account-empty" role="alert"><h3>Unable to load accounts</h3><p>{error}</p><button type="button" className="account-refresh" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>}
      {loading && <div className="account-empty" role="status"><span className="account-loading" aria-hidden="true" /><p>Loading {label.toLowerCase()} accounts...</p></div>}
      {!loading && result && <>
        <div className="account-grid">{result.users.map((item) => <button type="button" className="account-tile" key={item._id} onClick={() => onSelect(item)} aria-label={`Open ${item.name}'s dashboard`}>
          <span className="account-tile-top"><AccountAvatar key={item.photoUrl || 'default'} photoUrl={item.photoUrl} /><span className={`account-status ${item.status === 'Active' ? 'is-active' : ''}`}><i />{item.status}</span></span>
          <span className="account-name">{item.name}</span>
          <span className="account-phone"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z" /></svg>{item.phone || 'Phone not added'}</span>
          <span className="account-email">{item.email}</span>
          <span className="account-tile-footer"><span>Show dashboard</span><span aria-hidden="true">&rarr;</span></span>
        </button>)}</div>
        {!result.users.length && <div className="account-empty"><h3>{search ? 'No matching accounts' : 'No accounts yet'}</h3><p>{search ? 'Try a different name or email address.' : `${label} accounts will appear here once created.`}</p>{search && <button type="button" className="account-refresh" onClick={() => { setSearch(''); setPage(1); }}>Clear search</button>}</div>}
        <footer className="account-pagination"><span>{result.pagination.total ? `${(result.pagination.page - 1) * result.pagination.limit + 1}-${Math.min(result.pagination.page * result.pagination.limit, result.pagination.total)} of ${result.pagination.total} accounts` : '0 accounts'}</span><div><button type="button" disabled={result.pagination.page <= 1} onClick={() => setPage(result.pagination.page - 1)}>Previous</button><span>Page {result.pagination.page} of {result.pagination.totalPages}</span><button type="button" disabled={result.pagination.page >= result.pagination.totalPages} onClick={() => setPage(result.pagination.page + 1)}>Next</button></div></footer>
      </>}
    </div>
  </section>;
  return <>
    <div className="page-title"><div><h1>{account ? `${account.name} — ${label} dashboard` : `${label} accounts`}</h1><p>{account ? account.email : 'Select a name to view its dashboard.'}</p></div></div>
    <article className="stock-list-card">
      <div className="card-heading"><h3>{role === 'warehouse' ? 'Overview' : 'Account overview'}</h3><div>{self ? <button type="button" className="outline" onClick={() => onNavigate(role === 'warehouse' ? 'Material Receiving' : role === 'qc-test' ? 'Receiving Stock' : 'Create Requisition')}>{role === 'warehouse' ? 'Material Receiving' : role === 'qc-test' ? 'Receiving Stock' : 'Create Requisition'}</button> : <button type="button" className="outline" onClick={() => onSelect(null)}>Back to accounts</button>} <button type="button" className="outline" disabled={loading} onClick={() => setRefresh((value) => value + 1)}>Refresh</button></div></div>
      {!account && <input aria-label="Search accounts" placeholder="Search name or email" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />}
      {error && <p role="alert" className="error-toast">{error}</p>}
      {loading && <p role="status">Loading...</p>}
      {!loading && result && (account ? <>
        {role === 'warehouse' && <>
          <p>Currently available stock across all warehouse accounts.</p>
          <DashboardStats stats={[
            ...((result.warehouseStock || []).length
              ? result.warehouseStock.map((item) => ['Available stock', `${item.available.toLocaleString()} ${item._id || ''}`, 'across all warehouse accounts', 'green'])
              : [['Available stock', '0', 'across all warehouse accounts', 'green']]),
          ]} />
          <h3>This account's records</h3>
        </>}
        <p>{role === 'qc-test' ? 'Receipts assigned to this QC account' : role === 'warehouse' ? 'Receipts received by this warehouse account' : 'Transactions created by this production account'} · Total: {result.totals.reduce((sum, item) => sum + item.count, 0)}</p>
        <DashboardStats stats={[
          ['Total records', result.totals.reduce((sum, item) => sum + item.count, 0), 'for this account', 'blue'],
          ...result.totals.map((item, index) => [item._id, item.count, 'records', ['amber', 'green', 'rose', 'blue'][index % 4]]),
        ]} />
        <h3>Latest records (up to 20)</h3>
        {result.records.length ? <div className="table-wrap"><table className="stock-table"><thead><tr><th>Reference</th><th>Material</th><th>Batch / Type</th><th>Status</th></tr></thead><tbody>{result.records.map((item) => <tr key={item._id}><td>{item.grnNumber || item.number}</td><td>{item.materialName}</td><td>{item.batchNo || item.kind || '—'}</td><td>{item.status}</td></tr>)}</tbody></table></div> : <p>No records for this account yet.</p>}
      </> : <>
        <div className="table-wrap"><table className="stock-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody>{result.users.map((item) => <tr key={item._id}><td><button type="button" className="outline" onClick={() => onSelect(item)}>{item.name}</button></td><td>{item.email}</td><td>{item.status}</td></tr>)}</tbody></table></div>
        {!result.users.length && <p>No {label.toLowerCase()} accounts found.</p>}
        <div className="card-heading"><span>{result.pagination.total} accounts · Page {result.pagination.page} of {result.pagination.totalPages}</span><div><button type="button" className="outline" disabled={result.pagination.page <= 1} onClick={() => setPage(result.pagination.page - 1)}>Previous</button> <button type="button" className="outline" disabled={result.pagination.page >= result.pagination.totalPages} onClick={() => setPage(result.pagination.page + 1)}>Next</button></div></div>
      </>)}
    </article>
  </>;
}
