import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../features/warehouse/workflowApi';

export default function AvailableMaterials({ token, onNavigate }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    workflowApi.get(token, 'batches').then((data) => { if (active) setRecords(data.records); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, reload]);
  const visible = records.filter((item) => `${item.materialCode} ${item.materialName} ${item.batchNo}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="flow-page">
    <div className="page-title"><div><h1>Available materials</h1><p>QC approved and physically accepted by Warehouse. Request material; Warehouse confirms dispensing before transfer.</p></div><button className="primary" onClick={() => onNavigate('Create Requisition')}>Create requisition</button></div>
    <div className="card-heading"><input aria-label="Search available materials" placeholder="Search material code, name or batch" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="outline" disabled={loading} onClick={() => setReload((value) => value + 1)}>Refresh</button></div>
    {error && <p role="alert" className="form-message error">{error}</p>}
    <article className="stock-list-card"><div className="table-wrap"><table className="stock-table"><thead><tr><th>Material code</th><th>Material name</th><th>Batch</th><th>Available quantity</th><th>Expiry</th><th>Location</th></tr></thead><tbody>{loading ? <tr><td colSpan="6">Loading available stock...</td></tr> : visible.map((item) => <tr key={item._id}><td>{item.materialCode}</td><td>{item.materialName}</td><td>{item.batchNo}</td><td>{item.availableQuantity} {item.quantityUnit}</td><td>{new Date(item.expiryDate).toLocaleDateString()}</td><td>{item.verification?.location}</td></tr>)}{!loading && !error && !visible.length && <tr><td colSpan="6">No available materials found.</td></tr>}</tbody></table></div></article>
  </section>;
}
