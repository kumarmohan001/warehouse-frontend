import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../../features/warehouse/workflowApi';
import { statusLabel } from './WorkflowComponents';

export default function WorkflowOverview({ token, mode, onNavigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    workflowApi.get(token, 'summary').then((value) => { if (active) setData(value); }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [token, reload]);
  const links = mode === 'admin' ? ['Stock Overview', 'QC Records', 'Production Requests', 'Dispatch', 'Warehouse / Location'] : mode === 'production' ? ['Create Requisition', 'Receive Material', 'FG Handover'] : mode === 'qc' ? ['Sampling', 'Enter Test Results', 'Approve / Reject / Hold'] : ['Material Receiving', 'QC Approved Queue', 'Dispensing', 'FG Receiving', 'FG Dispatch'];
  return <section className="flow-page"><div className="page-title"><div><h1>{mode === 'admin' ? 'Administrator' : mode === 'qc' ? 'QC' : mode === 'production' ? 'Production' : 'Warehouse'} dashboard</h1><p>Live workflow and stock quantities, separated by status and unit.</p></div><button className="outline" onClick={() => setReload((value) => value + 1)}>Refresh</button></div>
    <div className="flow-buttons">{links.map((page) => <button className="outline" key={page} onClick={() => onNavigate(page)}>{page}</button>)}</div>
    {error && <p className="form-message error" role="alert">{error}</p>}
    {!data ? <p>Loading live totals...</p> : <><h3>Raw material stock</h3><div className="flow-summary">{data.raw.map((item) => <article key={`${item._id.status}-${item._id.unit}`}><small>{statusLabel(item._id.status)}</small><b>{item.quantity.toLocaleString()} {item._id.unit}</b><span>{item.count} batches</span></article>)}</div>{!data.raw.length && <p>No material receipts yet.</p>}<h3>Transactions & finished goods</h3><div className="flow-summary">{data.transactions.map((item) => <article key={`${item._id.kind}-${item._id.status}-${item._id.unit}`}><small>{item._id.kind === 'fg' ? 'Finished goods' : item._id.kind} · {item._id.status}</small><b>{item.count} records</b><span>{item.quantity.toLocaleString()} {item._id.unit}</span></article>)}</div><div className="flow-note"><b>Availability rule</b><p>QC approval confirms quality. Stock becomes available only after warehouse acceptance. Requisitions and dispatch requests do not deduct stock; confirmed dispensing and dispatch do.</p></div></>}
  </section>;
}
