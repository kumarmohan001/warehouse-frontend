import QcLifecycle from './components/QcLifecycle';
import React, { useEffect, useState } from 'react';
import { warehouseApi } from '../../features/warehouse/warehouseApi';

const statuses = ['Quarantine', 'Document Hold', 'Under Test', 'Approved', 'Rejected', 'Hold'];
const fields = ['grnNumber', 'materialType', 'materialCode', 'materialName', 'supplierName', 'poNumber', 'invoiceNumber', 'batchNo', 'manufacturer', 'receivedQuantity', 'quantityUnit', 'containers', 'manufacturingDate', 'expiryDate', 'receivingDate', 'storageRequirement', 'documentStatus', 'status', 'remarks', 'createdAt', 'updatedAt'];
const label = (value) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
const date = (value) => value ? new Date(value).toLocaleDateString() : '—';

export default function ReceivingStock({ token, user, selectedReceiptId, onCloseReceipt = () => {} }) {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptId, setReceiptId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      warehouseApi.list(token, { page, search, status: filter }).then((data) => {
        if (active) { setRecords(data.records); setPagination(data.pagination); }
      }).catch((error) => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [token, page, search, filter, reload]);

  useEffect(() => { if (selectedReceiptId) setReceiptId(selectedReceiptId); }, [selectedReceiptId]);
  useEffect(() => {
    if (!receiptId) { setReceipt(null); return; }
    let active = true;
    setReceipt(null); setError('');
    warehouseApi.detail(token, receiptId).then(({ record }) => {
      if (active) { setReceipt(record); setStatus(record.status); setNote(''); }
    }).catch((error) => { if (active) { setError(error.message); setReceiptId(null); } });
    return () => { active = false; };
  }, [token, receiptId]);

  const close = () => { if (!saving) { setReceiptId(null); onCloseReceipt(); } };
  const canChange = receipt && (user?.role === 'admin' || (user?.role === 'qc-test' && String(receipt.qcAssignedTo?._id) === String(user?.id || user?._id)));
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const { record } = await warehouseApi.updateStatus(token, receipt._id, { status, note });
      setReceipt(record); setStatus(record.status); setNote(''); setReload((value) => value + 1);
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  }

  return <section className="stock-list-page">
    <div className="page-title"><div><h1>Receiving Stock</h1><p>Review all material receipts and manage QC status.</p></div><button className="outline" onClick={() => { setError(''); setReload((value) => value + 1); }}>Refresh</button></div>
    {error && <p className="stock-toast error-toast" role="alert">{error}</p>}
    <div className="receiving-fields qc-stock-filters"><label>Search receipts<input value={search} placeholder="GRN, material, supplier or batch" onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><label>Status<select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label></div>
    <article className="stock-list-card"><div className="table-wrap"><table className="stock-table"><thead><tr><th>GRN</th><th>Material / Batch</th><th>Supplier</th><th>Quantity</th><th>QC reviewer</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="7">Loading receipts...</td></tr> : records.length ? records.map((record) => <tr key={record._id}><td><button className="text-button" onClick={() => setReceiptId(record._id)}>{record.grnNumber}</button></td><td>{record.materialName}<small>{record.batchNo}</small></td><td>{record.supplierName}</td><td>{record.receivedQuantity} {record.quantityUnit}</td><td>{record.qcAssignedTo?.name || 'Not assigned'}</td><td>{record.status}</td><td><button className="outline" onClick={() => setReceiptId(record._id)}>View / Update</button></td></tr>) : <tr><td colSpan="7">No receipts found.</td></tr>}
    </tbody></table></div><div className="receiving-actions"><button className="outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, pagination.totalPages)} · {pagination.total} receipts</span><button className="outline" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div></article>
    {receiptId && <div className="user-modal-backdrop" onMouseDown={close}><article role="dialog" aria-modal="true" aria-label="Receiving details" className="user-form user-modal user-details qc-receipt-details" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><h3>{receipt?.grnNumber || 'Loading receipt...'}</h3><button type="button" className="modal-close" disabled={saving} onClick={close} aria-label="Close receipt">×</button></div>
      {receipt && <><QcLifecycle receipt={receipt} /><dl>{fields.map((field) => <div key={field}><dt>{label(field)}</dt><dd>{(field.endsWith('Date') || field.endsWith('At')) ? date(receipt[field]) : String(receipt[field] ?? '—')}</dd></div>)}<div><dt>Received by</dt><dd>{receipt.receivedBy?.name || '—'}</dd></div><div><dt>QC reviewer</dt><dd>{receipt.qcAssignedTo?.name || 'Not assigned'}</dd></div></dl>
        <div className="stock-documents"><h4>Documents</h4>{Object.entries(receipt.documents || {}).map(([key, document]) => document?.fileUrl ? <a key={key} href={document.fileUrl} target="_blank" rel="noreferrer">{label(key)}: {document.fileName || 'Open document'}</a> : <span key={key}>{label(key)}: {document?.fileName || 'Missing'}</span>)}</div>
        {canChange ? <form onSubmit={save} className="qc-status-form"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((value) => <option key={value} disabled={receipt.documentStatus !== 'Documents OK' && ['Quarantine', 'Under Test', 'Approved'].includes(value)}>{value}</option>)}</select></label><label>QC note / reason<textarea value={note} onChange={(event) => setNote(event.target.value)} required={['Hold', 'Rejected'].includes(status)} /></label><button className="primary" disabled={saving}>{saving ? 'Saving...' : 'Update status'}</button></form> : <p>Only the assigned QC reviewer or QC Manager can update this receipt.</p>}
        {error && <p className="error-toast" role="alert">{error}</p>}
        <h4>Status history</h4>{receipt.statusHistory?.length ? <ul>{receipt.statusHistory.map((entry, index) => <li key={entry._id || index}>{entry.from} → {entry.to} · {entry.changedBy?.name || 'QC'} · {date(entry.changedAt)}{entry.note && <p>{entry.note}</p>}</li>)}</ul> : <p>No QC status changes yet.</p>}
      </>}
    </article></div>}
  </section>;
}
