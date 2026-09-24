import { Pager } from '../shared/workflow/WorkflowComponents';
import React, { useEffect, useState } from 'react';
import { warehouseApi } from '../../features/warehouse/warehouseApi';

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';
const displayDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const editFields = ['grnNumber', 'supplierName', 'poNumber', 'invoiceNumber', 'batchNo', 'manufacturer', 'receivedQuantity', 'containers', 'manufacturingDate', 'expiryDate', 'receivingDate', 'storageRequirement', 'remarks'];
const documentFields = [['coa', 'COA'], ['invoiceDocument', 'Invoice'], ['packingList', 'Packing List'], ['otherDocuments', 'Other required documents']];

const editValues = (record) => Object.fromEntries(editFields.map((field) => [field, field.endsWith('Date') ? toDateInput(record[field]) : record[field] || '']));

export default function WarehouseStock({ token, onNavigate = () => {}, onCreate, initialToast = '' }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [qcUsers, setQcUsers] = useState([]);
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
  useEffect(() => { warehouseApi.qcAssignees(token).then((data) => setQcUsers(data.users || [])).catch((error) => setError(error.message)); }, [token]);
  useEffect(() => { if (initialToast) setToast(initialToast); }, [initialToast]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function openEdit(record) { setEditing(record); setEditForm({ ...editValues(record), qcAssignedTo: record.qcAssignedTo?._id || record.qcAssignedTo || '' }); setDocumentFiles({}); }
  async function saveEdit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const locked = editing.sampling?.number || ['Approved', 'Rejected', 'Available'].includes(editing.status);
      const data = await warehouseApi.update(token, editing._id, locked ? { qcAssignedTo: editForm.qcAssignedTo } : editForm);
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
    <article className="stock-list-card"><div className="card-heading"><div><p className="eyebrow">MATERIAL RECEIPTS</p><h3>{pagination.total} stock records</h3></div><button className="outline" type="button" onClick={loadRecords} disabled={loading}>↻ Refresh</button></div><div className="table-wrap"><table className="stock-table"><thead><tr><th>GRN</th><th>Material name</th><th>Supplier name</th><th>QC reviewer</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="table-state">Loading stock records…</td></tr> : records.length ? records.map((record) => <tr key={record._id}><td><b>{record.grnNumber}</b><small>{record.materialCode}</small></td><td>{record.materialName}</td><td>{record.supplierName}</td><td>{record.qcAssignedTo?.name || 'Not assigned'}</td><td>{displayDate(record.expiryDate)}</td><td><span className={`stock-status ${record.status === 'Quarantine' ? 'quarantine' : 'hold'}`}>{record.status}</span></td><td className="stock-actions"><button type="button" title="View record" aria-label={`View ${record.grnNumber}`} onClick={() => setViewing(record)}>◉</button><button disabled={record.status === 'Available'} type="button" title="Edit record" aria-label={`Edit ${record.grnNumber}`} onClick={() => openEdit(record)}>✎</button></td></tr>) : <tr><td colSpan="7" className="table-state">No stock receipts yet. Use “Fill stock form” to create one.</td></tr>}</tbody></table></div><Pager pagination={pagination} onPage={setPage} loading={loading} /></article>
    {viewing && <div className="user-modal-backdrop" onMouseDown={() => setViewing(null)}><article className="user-form user-modal user-details" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><h3>{viewing.materialName}</h3><p>{viewing.grnNumber} · {viewing.status}</p></div><button className="modal-close" type="button" onClick={() => setViewing(null)}>×</button></div><dl><div><dt>Supplier</dt><dd>{viewing.supplierName}</dd></div><div><dt>Batch</dt><dd>{viewing.batchNo}</dd></div><div><dt>Quantity</dt><dd>{viewing.receivedQuantity} {viewing.quantityUnit}</dd></div><div><dt>Expiry</dt><dd>{displayDate(viewing.expiryDate)}</dd></div><div><dt>Document status</dt><dd>{viewing.documentStatus}</dd></div><div><dt>Storage</dt><dd>{viewing.storageRequirement}</dd></div></dl><div className="stock-documents"><h4>Documents</h4>{Object.entries(viewing.documents || {}).map(([name, document]) => document?.fileUrl ? <a key={name} href={document.fileUrl} target="_blank" rel="noreferrer">{name}</a> : <span key={name}>{name}: Missing</span>)}</div></article></div>}
    {editing && <div className="user-modal-backdrop" onMouseDown={() => !saving && setEditing(null)}><form className="user-form user-modal stock-edit-form" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><h3>Edit {editing.grnNumber}</h3><p>{editing.materialName} ({editing.materialCode}) · <b>{editing.status}</b></p></div><button className="modal-close" type="button" onClick={() => !saving && setEditing(null)}>×</button></div><div className="user-fields"><label>Assign QC reviewer<select value={editForm.qcAssignedTo} onChange={(event) => setEditForm((values) => ({ ...values, qcAssignedTo: event.target.value }))}><option value="">Not assigned</option>{qcUsers.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.role === 'admin' ? 'QC Manager' : 'QC Test'})</option>)}</select></label>{!(editing.sampling?.number || ['Approved', 'Rejected', 'Available'].includes(editing.status)) && editFields.map((field) => <label key={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}{field === 'remarks' ? <textarea value={editForm[field]} onChange={(event) => setEditForm((values) => ({ ...values, [field]: event.target.value }))} /> : field === 'storageRequirement' ? <select value={editForm[field]} onChange={(event) => setEditForm((values) => ({ ...values, [field]: event.target.value }))}><option>Ambient / Room temperature</option><option>Cool (2–8°C)</option><option>Frozen (-20°C)</option><option>Protect from light</option><option>Dry storage</option></select> : <input required={field !== 'remarks'} type={field.endsWith('Date') ? 'date' : ['receivedQuantity', 'containers'].includes(field) ? 'number' : 'text'} value={editForm[field]} onChange={(event) => setEditForm((values) => ({ ...values, [field]: event.target.value }))} />}</label>)}</div><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</button>{!(editing.sampling?.number || ['Approved', 'Rejected', 'Available'].includes(editing.status)) && <section className="edit-documents"><h4>Upload / replace documents</h4><p>Complete documents release Document Hold into Quarantine. Existing QC decisions are preserved.</p><div className="document-grid">{documentFields.map(([key, label]) => <label className="document-upload" key={key}><span>{label}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setDocumentFiles((files) => ({ ...files, [key]: event.target.files[0] }))} /><small>{documentFiles[key]?.name || (editing.documents?.[key === 'invoiceDocument' ? 'invoice' : key === 'otherDocuments' ? 'otherRequiredDocuments' : key]?.fileName || 'No file selected')}</small></label>)}</div><button className="outline" type="button" disabled={saving} onClick={saveDocuments}>{saving ? 'Uploading...' : 'Upload documents'}</button></section>}</form></div>}
  </section>;
}
