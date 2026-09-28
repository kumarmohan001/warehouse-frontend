import SamplersReport from '../qc/SamplersReport';
import { GrnFields, GrnRecord, editGrn } from './GrnForm';
import QcLifecycle from '../qc/components/QcLifecycle';
import { Pager } from '../shared/workflow/WorkflowComponents';
import React, { useEffect, useState } from 'react';
import { warehouseApi } from '../../features/warehouse/warehouseApi';

const displayDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const documentFields = [['coa', 'COA'], ['invoiceDocument', 'Invoice'], ['packingList', 'Packing List'], ['otherDocuments', 'Other required documents']];


export default function WarehouseStock({ token, user, onNavigate = () => {}, onCreate, initialToast = '', selectedReceiptId, onCloseReceipt = () => {} }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [documentFiles, setDocumentFiles] = useState({});
  const [saving, setSaving] = useState(false);

  const loadRecords = async () => {
    setLoading(true); setError('');
    try { const data = await warehouseApi.list(token, { page, search }); setRecords(data.records || []); setPagination(data.pagination); }
    catch (requestError) { setError(requestError.message || 'Unable to load stock records.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRecords(); }, [token, page, search]);
  useEffect(() => { if (initialToast) setToast(initialToast); }, [initialToast]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    let active = true;
    if (selectedReceiptId) warehouseApi.detail(token, selectedReceiptId).then(({ record }) => { if (active) { setViewing(record); } }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [token, selectedReceiptId]);
  async function openViewing(record) {
    setError('');
    try { const data = await warehouseApi.detail(token, record._id); setViewing(data.record); }
    catch (error) { setError(error.message || 'Unable to load receipt.'); }
  }
  function closeViewing() { setViewing(null); onCloseReceipt(); }
  function openEdit(record) { setEditing(record); setEditForm(editGrn(record)); setDocumentFiles({}); }
  async function saveEdit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const data = await warehouseApi.update(token, editing._id, editForm);
      setRecords((current) => current.map((record) => record._id === editing._id ? data.record : record));
      setEditing(null); setToast('Stock record updated successfully.');
    } catch (requestError) { setError(requestError.message || 'Unable to update stock record.'); }
    finally { setSaving(false); }
  }
  async function saveDocuments() {
    const files = Object.entries(documentFiles).filter(([, file]) => file);
    if (!files.length) { setError('Choose at least one document to upload.'); return; }
    setSaving(true); setError('');
    const payload = new FormData(); files.forEach(([name, file]) => payload.append(name, file));
    try {
      const data = await warehouseApi.updateDocuments(token, editing._id, payload);
      const record = data.record;
      setRecords((current) => current.map((item) => item._id === record._id ? record : item));
      setEditing(null); setDocumentFiles({});
      setToast(`Documents updated. Current status: ${record.status}.`);
    } catch (requestError) { setError(requestError.message || 'Unable to upload documents.'); }
    finally { setSaving(false); }
  }

  return <section className="stock-list-page">
    {toast && <div className="success-toast" role="status">✓ {toast}</div>}
    <div className="page-title"><div><h1>Stock Form / Material Receipts</h1><p>All material receipts recorded in the warehouse.</p></div><button className="primary" type="button" onClick={onCreate || (() => onNavigate('Stock Form'))}>＋ Create stock form</button></div>
    {error && <div className="stock-toast error-toast" role="alert">⚠ {error}</div>}
    <input aria-label="Search receiving records" placeholder="Search GRN, material, batch or supplier" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
    <article className="stock-list-card"><div className="card-heading"><div><p className="eyebrow">MATERIAL RECEIPTS</p><h3>{pagination.total} stock records</h3></div><button className="outline" type="button" onClick={loadRecords} disabled={loading}>↻ Refresh</button></div><div className="table-wrap"><table className="stock-table"><thead><tr><th>GRN</th><th>Material name</th><th>Supplier name</th><th>QC reviewer</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="table-state">Loading stock records…</td></tr> : records.length ? records.map((record) => <tr key={record._id}><td><button className="text-button" onClick={() => openViewing(record)}>{record.grnNumber}</button><small>{record.materialCode}</small></td><td>{record.materialName}</td><td>{record.supplierName}</td><td>{record.qcAssignedTo?.name || 'Not assigned'}</td><td>{displayDate(record.expiryDate)}</td><td><span className={`stock-status ${record.status === 'Quarantine' ? 'quarantine' : 'hold'}`}>{record.status}</span></td><td className="stock-actions"><button type="button" title="View record" aria-label={`View ${record.grnNumber}`} onClick={() => openViewing(record)}>◉</button><button disabled={Boolean(record.sampling?.number) || ['Approved', 'Rejected', 'Available'].includes(record.status)} type="button" title="Edit record" aria-label={`Edit ${record.grnNumber}`} onClick={() => openEdit(record)}>✎</button></td></tr>) : <tr><td colSpan="7" className="table-state">No stock receipts yet. Use “Fill stock form” to create one.</td></tr>}</tbody></table></div><Pager pagination={pagination} onPage={setPage} loading={loading} /></article>
    {viewing && <div className="user-modal-backdrop" onMouseDown={closeViewing}><article className="user-form user-modal user-details" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><h3>{viewing.materialName}</h3><p>{viewing.grnNumber} · {viewing.status}</p></div><button className="modal-close" type="button" onClick={closeViewing}>×</button></div><QcLifecycle receipt={viewing} /><button type="button" className="outline" onClick={() => window.print()}>Print GRN</button><GrnRecord key={viewing._id} record={viewing} token={token} user={user} onSaved={setViewing} /><div className="stock-documents"><h4>Documents</h4>{Object.entries(viewing.documents || {}).map(([name, document]) => document?.fileUrl ? <a key={name} href={document.fileUrl} target="_blank" rel="noreferrer">{name}</a> : <span key={name}>{name}: Missing</span>)}</div><SamplersReport key={viewing._id} record={viewing} token={token} user={user} onSaved={setViewing} /></article></div>}
    {editing && <div className="user-modal-backdrop" onMouseDown={() => !saving && setEditing(null)}><form className="user-form user-modal stock-edit-form" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><h3>Edit {editing.grnNumber}</h3><p>{editing.materialName} ({editing.materialCode}) · <b>{editing.status}</b></p></div><button className="modal-close" type="button" onClick={() => !saving && setEditing(null)}>×</button></div><GrnFields values={editForm} onChange={(event) => setEditForm((values) => ({ ...values, [event.target.name]: event.target.value }))} /><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</button>{!(editing.sampling?.number || ['Approved', 'Rejected', 'Available'].includes(editing.status)) && <section className="edit-documents"><h4>Upload / replace documents</h4><p>Complete documents release Document Hold into Quarantine. Existing QC decisions are preserved.</p><div className="document-grid">{documentFields.map(([key, label]) => <label className="document-upload" key={key}><span>{label}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setDocumentFiles((files) => ({ ...files, [key]: event.target.files[0] }))} /><small>{documentFiles[key]?.name || (editing.documents?.[key === 'invoiceDocument' ? 'invoice' : key === 'otherDocuments' ? 'otherRequiredDocuments' : key]?.fileName || 'No file selected')}</small></label>)}</div><button className="outline" type="button" disabled={saving} onClick={saveDocuments}>{saving ? 'Uploading...' : 'Upload documents'}</button></section>}</form></div>}
  </section>;
}
