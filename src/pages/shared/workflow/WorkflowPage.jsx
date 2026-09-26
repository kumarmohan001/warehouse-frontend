import React, { useEffect, useState } from 'react';
import QcLifecycle from '../../qc/components/QcLifecycle';
import { qcCompletion } from './qcCompletion';
import { warehouseApi } from '../../../features/warehouse/warehouseApi';
import { workflowApi } from '../../../features/warehouse/workflowApi';
import WorkflowAction from './WorkflowAction';
import FinishedGoodsProgress from './FinishedGoodsProgress';
import { Status, Modal, Documents, Pager, RecordDetails, formatDate, person, statusLabel } from './WorkflowComponents';

const actionNames = { sampling: 'Sampling Details', tests: 'Enter QC test results', decision: 'QC final decision', acceptRaw: 'Warehouse verification & acceptance', requisition: 'Create material requisition', dispense: 'Confirm material dispensing', receive: 'Production receipt check', resolve: 'Resolve discrepancy', fg: 'Create FG handover', submitFg: 'Submit FG handover', acceptFg: 'Verify finished goods', dispatch: 'Create FG dispatch request', confirmDispatch: 'Confirm FG dispatch', uploadQc: 'Upload QC documents', uploadFg: 'Upload FG documents', adjust: 'Authorized stock adjustment' };
const states = { raw: ['Document Hold', 'Quarantine', 'Under Test', 'Hold', 'Approved', 'Rejected', 'Available'], requisition: ['Pending', 'Partially Dispensed', 'Sent to Production', 'Discrepancy', 'Completed'], fg: ['Pending Documents', 'Pending Verification', 'Discrepancy', 'Available'], dispatch: ['Pending', 'Dispatched'] };
actionNames.editDispatch = 'Edit dispatch quantity';

export default function WorkflowPage({ token, user, title, kind = 'raw', mode, defaultStatus = '', awaitingReceipt = false, selectedReceiptId, onCloseReceipt = () => {}, onNavigate }) {
  const raw = kind === 'raw';
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [reload, setReload] = useState(0);
  const [lookups, setLookups] = useState({ locations: [], qcUsers: [], materials: [] });
  const [selected, setSelected] = useState(null);
  const [record, setRecord] = useState(null);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('Details');
  const [trace, setTrace] = useState(null);
  const [tracePage, setTracePage] = useState(1);
  const [traceError, setTraceError] = useState('');
  const [summary, setSummary] = useState(null);
  const getRecord = (id) => raw ? warehouseApi.detail(token, id) : workflowApi.get(token, `records/${kind}/${id}`);

  useEffect(() => {
    let active = true;
    workflowApi.get(token, 'lookups').then((data) => { if (active) setLookups(data); }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [token, reload]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const timer = setTimeout(() => {
      const work = raw ? warehouseApi.list(token, { page, search, status }) : workflowApi.get(token, `records/${kind}`, { page, search, status, awaitingReceipt });
      work.then((data) => { if (active) { setRecords(data.records); setPagination({ ...data.pagination, page }); } }).catch((error) => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [token, page, search, status, reload, kind, awaitingReceipt]);
  useEffect(() => { if (selectedReceiptId) setSelected(selectedReceiptId); }, [selectedReceiptId]);
  useEffect(() => {
    let active = true;
    setRecord(null); setTab('Details'); setTracePage(1);
    if (selected) getRecord(selected).then((data) => { if (active) { setRecord(data.record); if (selectedReceiptId === selected && title === 'Sampling Details' && !data.record.sampling?.number && data.record.status === 'Quarantine') setAction('sampling'); } }).catch((error) => { if (active) { setError(error.message); setSelected(null); } });
    return () => { active = false; };
  }, [selected, token, kind, reload]);
  useEffect(() => {
    let active = true;
    if (raw) workflowApi.get(token, 'summary').then((data) => { if (active) setSummary(data.raw); }).catch(() => {});
    return () => { active = false; };
  }, [raw, token, reload]);
  useEffect(() => {
    let active = true;
    setTrace(null); setTraceError('');
    if (selected && tab === 'Traceability') workflowApi.get(token, `trace/${selected}`, { page: tracePage }).then((data) => { if (active) setTrace(data); }).catch((error) => { if (active) setTraceError(error.message); });
    return () => { active = false; };
  }, [selected, tab, tracePage, token, reload]);

  function close() { if (busy) return; setAction(null); setSelected(null); setRecord(null); onCloseReceipt(); }
  function saved(updated) { setRecord(updated); setAction(null); setSelected(updated._id); setReload((value) => value + 1); setToast('Saved successfully. Stock and workflow status are up to date.'); }
  const completion = {
    ...qcCompletion(record),
    uploadFg: (record?.documents || []).some((document) => Boolean(document.fileUrl)),
  };
  async function openAction(name) {
    if (busy) return;
    if (name !== 'decision') { setAction(name); return; }
    setBusy(true); setError('');
    try {
      const data = await getRecord(record._id);
      setRecord(data.record);
      setAction(name);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  const createAction = kind === 'requisition' && mode === 'production' ? 'requisition' : kind === 'fg' && mode === 'production' ? 'fg' : kind === 'dispatch' ? 'dispatch' : null;
  const qcOwner = record && (user.role === 'admin' || (!record.qcAssignedTo || String(record.qcAssignedTo?._id || record.qcAssignedTo) === String(user.id || user._id)));
  const productionOwner = record && (user.role === 'admin' || String(record.createdBy?._id || record.createdBy) === String(user.id || user._id));
  const availableActions = [];
  if (record) {
    if (raw && mode === 'qc' && qcOwner && (user.role === 'admin' || user.role === 'qc-test')) {
      if (!record.sampling?.number && ['Quarantine', 'Hold'].includes(record.status) && record.documentStatus === 'Documents OK') availableActions.push('sampling');
      if (record.sampling?.number && ['Under Test', 'Hold'].includes(record.status)) availableActions.push('tests', 'uploadQc');
      if (['Quarantine', 'Under Test', 'Hold'].includes(record.status)) availableActions.push('decision');
    }
    if (raw && mode === 'warehouse' && record.status === 'Approved' && ['warehouse', 'admin'].includes(user.role)) availableActions.push('acceptRaw');
    if (kind === 'requisition' && mode === 'warehouse' && ['warehouse', 'admin'].includes(user.role)) {
      if (['Pending', 'Partially Dispensed'].includes(record.status)) availableActions.push('dispense');
      if (record.issues.some((issue) => issue.status === 'Discrepancy')) availableActions.push('resolve');
    }
    if (kind === 'requisition' && mode === 'production' && productionOwner && record.issues.some((issue) => issue.status === 'Sent to Production')) availableActions.push('receive');
    if (kind === 'fg' && mode === 'production' && productionOwner) {
      if (['Pending Documents', 'Discrepancy'].includes(record.status)) availableActions.push('uploadFg');
      if (record.status === 'Pending Documents') availableActions.push('submitFg');
    }
    if (kind === 'fg' && mode === 'warehouse' && ['Pending Verification', 'Discrepancy'].includes(record.status)) availableActions.push('acceptFg');
    if (kind === 'dispatch' && record.status === 'Pending') availableActions.push('confirmDispatch');
    if (kind === 'dispatch' && record.status === 'Pending' && user.role === 'admin') availableActions.push('editDispatch');
    if (user.role === 'admin' && (raw || kind === 'fg') && record.status === 'Available') availableActions.push('adjust');
  }
  const documents = record ? (raw ? [...Object.entries(record.documents || {}).filter(([, file]) => file.fileUrl).map(([kind, file]) => ({ ...file, kind })), ...(record.qc?.documents || [])] : record.documents || []) : [];

  return <section className="flow-page">
    <div className="page-title"><div><p className="eyebrow">{mode === 'qc' ? 'QUALITY CONTROL' : mode === 'production' ? 'PRODUCTION' : 'WAREHOUSE'}</p><h1>{title}</h1><p>{raw ? 'Track each material batch from receiving through QC and warehouse acceptance.' : 'Every confirmed action records the user, time and material reference.'}</p></div><div className="flow-buttons">{raw && mode === 'warehouse' && <button className="outline" onClick={() => onNavigate('Warehouse / Location')}>Manage locations</button>}<button className="outline" onClick={() => setReload((value) => value + 1)}>Refresh</button>{createAction && <button className="primary" onClick={() => { setSelected(null); setRecord(null); setAction(createAction); }}>{actionNames[createAction]}</button>}</div></div>
    {toast && <p className="flow-success" role="status">{toast}<button type="button" aria-label="Dismiss" onClick={() => setToast('')}>×</button></p>}
    {error && <p className="form-message error" role="alert">{error}</p>}
    {raw && summary && <div className="flow-summary">{summary.map((item) => <button key={`${item._id.status}-${item._id.unit}`} onClick={() => { setStatus(item._id.status); setPage(1); }}><small>{statusLabel(item._id.status)}</small><b>{item.quantity.toLocaleString()} {item._id.unit}</b><span>{item.count} batches</span></button>)}</div>}
    <div className="flow-filters"><input aria-label="Search records" placeholder="Search number, material, batch or supplier" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select aria-label="Filter status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{defaultStatus.includes(',') && <option value={defaultStatus}>Pending workflow</option>}{states[kind].map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div>
    <article className="stock-list-card"><div className="table-wrap"><table className="stock-table"><thead><tr><th>Reference</th><th>Material / Batch</th><th>Quantity</th><th>Available</th><th>Location / Owner</th><th>Status</th><th>Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="table-state">Loading records...</td></tr> : records.length ? records.map((item) => <tr key={item._id}><td><button className="text-button" onClick={() => { setSelected(item._id); setAction(null); }}>{item.grnNumber || item.number}</button><small>{item.materialCode}</small></td><td>{item.materialName}<small>{item.batchNo || item.productionOrder || 'Batch pending'}</small></td><td>{item.receivedQuantity ?? item.quantity} {item.quantityUnit}</td><td>{item.status === 'Available' ? `${item.availableQuantity} ${item.quantityUnit}` : 'Blocked / not stock'}</td><td>{item.verification?.location || item.location || item.qcAssignedTo?.name || item.createdBy?.name || 'Not assigned'}</td><td><Status value={item.status} />{item.sampling?.number && <small>Sampled material ? {item.sampling.number}</small>}</td><td><button className="outline" onClick={() => { setSelected(item._id); setAction(null); }}>Open record</button></td></tr>) : <tr><td colSpan="7" className="table-state">No records match this view.</td></tr>}</tbody></table></div><Pager pagination={pagination} onPage={setPage} loading={loading} /></article>
    {(selected || action) && <Modal title={action ? actionNames[action] : `${record?.grnNumber || record?.number || 'Loading...'} · ${record?.materialName || ''}`} busy={busy} onClose={close}>
      {action ? <WorkflowAction key={action + (record?._id || '')} action={action} record={record} token={token} user={user} lookups={lookups} onSaved={saved} onBusy={setBusy} onCancel={() => record ? setAction(null) : close()} /> : !record ? <p>Loading details...</p> : <>
        <div className="flow-record-header"><Status value={record.status} />{record.sampling?.number && <span>Sampled material · {record.sampling.number}</span>}<div className="flow-buttons">{availableActions.map((name) => <button key={name} disabled={busy} className={completion[name] === true ? 'outline qc-action-complete' : name === 'sampling' || name === 'acceptRaw' ? 'primary' : 'outline'} onClick={() => openAction(name)}>{actionNames[name]}{completion[name] === true ? ['uploadQc', 'uploadFg'].includes(name) ? ' — Uploaded ✓' : ' — Saved ✓' : ''}</button>)}</div></div>
        <FinishedGoodsProgress record={record} kind={kind} />
        {kind === 'fg' && mode === 'warehouse' && record.status !== 'Available' && <button className="text-button" onClick={() => { close(); onNavigate('Warehouse / Location'); }}>Manage storage locations</button>}
        {raw && mode === 'qc' && <p className="lifecycle-description">Test results: {completion.tests ? `${record.qc.tests.length} saved` : 'Not saved'} · QC documents: {completion.uploadQc ? 'Uploaded' : `Missing ${completion.missingDocuments.join(', ')}`}</p>}
        {raw && record.status !== 'Available' && <p className="flow-note">This material is blocked for production until QC approves it and Warehouse physically accepts it.</p>}
        {raw && mode === 'warehouse' && ['Document Hold', 'Quarantine', 'Hold'].includes(record.status) && <button className="text-button" onClick={() => { close(); onNavigate('Stock Form'); }}>Open receipt editor / QC assignment</button>}
        {raw && <QcLifecycle receipt={record} />}
        <nav className="flow-tabs" aria-label="Record sections">{['Details', 'Documents', 'Traceability'].map((name) => <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name}</button>)}</nav>
        {tab === 'Details' && <RecordDetails record={record} raw={raw} />}
        {tab === 'Documents' && <Documents documents={documents} />}
        {tab === 'Traceability' && <>{traceError ? <p className="form-message error" role="alert">{traceError}</p> : !trace ? <p>Loading transaction history...</p> : <>{trace.receipts.map((receipt) => <div className="flow-note" key={receipt._id}><b>Supplier receipt: {receipt.grnNumber}</b><p>{receipt.supplierName} → {receipt.materialName} / {receipt.batchNo} · {receipt.receivedQuantity} {receipt.quantityUnit} · {formatDate(receipt.createdAt)}</p></div>)}<ol className="flow-timeline">{trace.events.map((entry) => <li key={entry._id}><b>{entry.action}</b><span>{entry.reference} · {entry.number}</span><small>{person(entry.actor)} · {formatDate(entry.createdAt)}</small>{entry.quantity !== undefined && <p>Quantity: {entry.quantity} {entry.unit}</p>}{entry.note && <p>{entry.note}</p>}{entry.details && <details><summary>Audit details</summary><pre>{JSON.stringify(entry.details, null, 2)}</pre></details>}</li>)}</ol>{!trace.events.length && <p>No workflow actions recorded yet.</p>}<Pager pagination={trace.pagination} onPage={setTracePage} /></>}</>}
      </>}
    </Modal>}
  </section>;
}
