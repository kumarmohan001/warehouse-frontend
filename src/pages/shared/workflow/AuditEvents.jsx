import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../../features/warehouse/workflowApi';
import { Pager, formatDate, person } from './WorkflowComponents';

export default function AuditEvents({ token }) {
  const [data, setData] = useState({ events: [], pagination: { page: 1, total: 0, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const timer = setTimeout(() => workflowApi.get(token, 'events', { page, search }).then((result) => { if (active) setData(result); }).catch((error) => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); }), 200);
    return () => { active = false; clearTimeout(timer); };
  }, [token, page, search]);
  return <section className="flow-page"><div className="page-title"><div><h1>All transactions</h1><p>Permanent audit history of QC, stock, production and dispatch actions.</p></div></div><input aria-label="Search audit history" placeholder="Search action, reference or reason" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />{error && <p className="form-message error">{error}</p>}<article className="stock-list-card"><div className="table-wrap"><table className="stock-table"><thead><tr>{['Transaction', 'Action', 'Reference', 'Quantity', 'User', 'Date / time', 'Details'].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading audit history...</td></tr> : data.events.map((entry) => <tr key={entry._id}><td>{entry.number}</td><td>{entry.action}</td><td>{entry.reference}</td><td>{entry.quantity ?? '—'} {entry.unit}</td><td>{person(entry.actor)}</td><td>{formatDate(entry.createdAt)}</td><td>{entry.note}{entry.details && <details><summary>View details</summary><pre>{JSON.stringify(entry.details, null, 2)}</pre></details>}</td></tr>)}</tbody></table></div><Pager pagination={data.pagination} onPage={setPage} loading={loading} /></article></section>;
}
