import React, { useEffect, useState } from 'react';

import { GrnHeader, GrnFields, GrnQc, newGrn } from './GrnForm';
import { warehouseApi } from '../../features/warehouse/warehouseApi';
import WarehouseStock from './WarehouseStock';

const documentFields = [['coa', 'COA'], ['invoiceDocument', 'Invoice'], ['packingList', 'Packing List'], ['otherDocuments', 'Other required documents']];
const initialForm = newGrn;

export default function StockForm({ token, user, onNavigate = () => {} }) {
  const [showForm, setShowForm] = useState(false);
  const [listToast, setListToast] = useState('');
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm((values) => ({ ...values, [event.target.name]: event.target.value }));

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);


  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setToast('');
    const payload = new FormData();
    Object.entries(form).forEach(([name, value]) => payload.append(name, value));
    Object.entries(documents).forEach(([name, file]) => { if (file) payload.append(name, file); });
    try {
      const data = await warehouseApi.create(token, payload);
      const record = data.record;
      setToast(record.status === 'Quarantine'
        ? `${record.grnNumber} created successfully and placed in Quarantine.`
        : `${record.grnNumber} created successfully but is on Document Hold due to missing documents.`);
      setForm(initialForm()); setDocuments({});
      setListToast(record.status === 'Quarantine'
        ? `${record.grnNumber} created successfully and placed in Quarantine.`
        : `${record.grnNumber} created successfully but is on Document Hold due to missing documents.`);
      setShowForm(false);
    } catch (requestError) { setError(requestError.message || 'Unable to create material receipt.'); }
    finally { setSaving(false); }
  }

  if (!showForm) return <WarehouseStock token={token} user={user} onNavigate={onNavigate} onCreate={() => setShowForm(true)} initialToast={listToast} />;

  return <section className="receiving-page">
    {user && <article className="receiving-card"><h3>Receiving account</h3><p><strong>{user.name}</strong> | {user.email}{user.phone ? ` | ${user.phone}` : ''}</p><small>This receipt is automatically saved under your signed-in account.</small></article>}
    {toast && <div className="success-toast" role="status">✓ {toast}</div>}
    <div className="page-title"><div><h1>Material Receiving / Goods Received Note</h1><p>Record supplier material before it enters the warehouse workflow.</p></div><span className="stock-rule">Not available for normal stock or production</span></div>
    {error && <div className="stock-toast error-toast" role="alert">⚠ {error}</div>}
    <form className="receiving-form" onSubmit={submit}>
      <div className="grn-sheet"><GrnHeader /><GrnFields values={form} onChange={update} /><GrnQc record={{ ...form, receivedBy: user }} disabled={saving} onSignatureChange={(key, value) => setForm(current => ({ ...current, [key]: value }))} /></div>
      <section className="receiving-card document-card"><div className="card-heading"><div><p className="eyebrow">DOCUMENT CHECK</p><h3>Upload and verify supplier documents</h3></div><span className="required-label">All documents required</span></div><p className="document-help">All four documents place the material in Quarantine. Any missing document places it on Document Hold.</p><div className="document-grid">{documentFields.map(([key, label]) => <label className="document-upload" key={key}><span>{label}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setDocuments((files) => ({ ...files, [key]: event.target.files[0] }))} /><small>{documents[key]?.name || 'No file selected'}</small></label>)}</div></section>
      <div className="receiving-actions"><button type="button" className="outline" onClick={() => setShowForm(false)}>Back to stock list</button><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Record Material Receipt'} <span>→</span></button></div>
    </form>
  </section>;
}
