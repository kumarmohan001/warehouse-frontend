import React, { useState } from 'react';
import { nextGrnNumber, saveReceivingRecord } from './stockRecords';

const documentFields = [
  ['coa', 'COA'], ['invoiceDocument', 'Invoice'], ['packingList', 'Packing List'], ['otherDocuments', 'Other required documents'],
];

const initialForm = () => ({
  grn: nextGrnNumber(), supplierName: '', poNumber: '', invoiceNumber: '', materialName: '', batchNo: '', manufacturer: '',
  receivedQuantity: '', containers: '', manufacturingDate: '', expiryDate: '', receivingDate: new Date().toISOString().slice(0, 10), storageRequirement: '', remarks: '',
});

export default function StockForm({ onNavigate = () => {} }) {
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [notice, setNotice] = useState('');
  const update = (event) => setForm((values) => ({ ...values, [event.target.name]: event.target.value }));
  const expirySoon = form.expiryDate && (new Date(form.expiryDate) - new Date()) / 86400000 <= 90;

  function submit(event) {
    event.preventDefault();
    const missing = documentFields.filter(([key]) => !documents[key]);
    const status = missing.length ? 'Document Hold' : 'Quarantine';
    saveReceivingRecord({ ...form, status, documents: Object.fromEntries(documentFields.map(([key, label]) => [label, documents[key]?.name || 'Missing'])), createdAt: new Date().toISOString() });
    setNotice(status === 'Quarantine'
      ? `${form.grn} recorded. Documents are OK and the material has been placed in Quarantine.`
      : `${form.grn} recorded as Document Hold. Missing: ${missing.map(([, label]) => label).join(', ')}.`);
  }

  return <section className="receiving-page">
    <div className="page-title"><div><h1>Material Receiving / Stock Form</h1><p>Record supplier material before it enters the warehouse workflow.</p></div><span className="stock-rule">Not available for normal stock or production</span></div>
    {notice && <div className="receiving-notice" role="status">{notice}</div>}
    <form className="receiving-form" onSubmit={submit}>
      <section className="receiving-card"><div className="card-heading"><div><p className="eyebrow">RECEIVING DETAILS</p><h3>Material and supplier information</h3></div><span className="grn-number">{form.grn} · Auto generated</span></div>
        <div className="receiving-fields">
          <label>GRN / Receiving No.<input value={form.grn} readOnly aria-readonly="true" /></label>
          <label>Supplier Name<input name="supplierName" value={form.supplierName} onChange={update} required /></label>
          <label>PO Number<input name="poNumber" value={form.poNumber} onChange={update} required /></label>
          <label>Invoice Number<input name="invoiceNumber" value={form.invoiceNumber} onChange={update} required /></label>
          <label>Material Name<input name="materialName" value={form.materialName} onChange={update} required /></label>
          <label>Batch No.<input name="batchNo" value={form.batchNo} onChange={update} required /></label>
          <label>Manufacturer<input name="manufacturer" value={form.manufacturer} onChange={update} required /></label>
          <label>Received Quantity<input name="receivedQuantity" type="number" min="0.001" step="any" value={form.receivedQuantity} onChange={update} required /></label>
          <label>Number of Containers/Bags<input name="containers" type="number" min="1" step="1" value={form.containers} onChange={update} required /></label>
          <label>Manufacturing Date<input name="manufacturingDate" type="date" value={form.manufacturingDate} onChange={update} required /></label>
          <label>Expiry Date <small className={expirySoon ? 'expiry-warning' : ''}>{expirySoon ? 'Expiry notification: within 90 days' : 'Expiry notification enabled'}</small><input name="expiryDate" type="date" min={form.manufacturingDate || undefined} value={form.expiryDate} onChange={update} required /></label>
          <label>Receiving Date<input name="receivingDate" type="date" value={form.receivingDate} onChange={update} required /></label>
          <label>Storage Requirement<select name="storageRequirement" value={form.storageRequirement} onChange={update} required><option value="">Select requirement</option><option>Ambient / Room temperature</option><option>Cool (2–8°C)</option><option>Frozen (-20°C)</option><option>Protect from light</option><option>Dry storage</option></select></label>
          <label className="full-field">Remarks<textarea name="remarks" value={form.remarks} onChange={update} placeholder="Enter receiving observations, discrepancies, or handling notes" /></label>
        </div>
      </section>
      <section className="receiving-card document-card"><div className="card-heading"><div><p className="eyebrow">DOCUMENT CHECK</p><h3>Upload and verify supplier documents</h3></div><span className="required-label">All documents required</span></div>
        <p className="document-help">Warehouse verifies these documents before placing the material in Quarantine.</p>
        <div className="document-grid">{documentFields.map(([key, label]) => <label className="document-upload" key={key}><span>{label}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setDocuments((files) => ({ ...files, [key]: event.target.files[0] }))} /><small>{documents[key]?.name || 'No file selected'}</small></label>)}</div>
      </section>
      <div className="receiving-actions"><button type="button" className="outline" onClick={() => onNavigate('Dashboard')}>Cancel</button><button className="primary" type="submit">Record Material Receipt <span>→</span></button></div>
      <p className="workflow-note"><b>Routing:</b> Documents OK → Quarantine. Documents Missing/Not OK → Document Hold. Neither status makes material available for normal stock or production.</p>
    </form>
  </section>;
}
