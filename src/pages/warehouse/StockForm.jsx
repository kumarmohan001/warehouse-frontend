import React, { useEffect, useState } from 'react';
import { nextGrnNumber } from './stockRecords';
import { materialMaster, materialTypes } from '../../data/materialMaster';
import { warehouseApi } from '../../features/warehouse/warehouseApi';
import WarehouseStock from './WarehouseStock';

const documentFields = [['coa', 'COA'], ['invoiceDocument', 'Invoice'], ['packingList', 'Packing List'], ['otherDocuments', 'Other required documents']];
const initialForm = () => ({ grn: nextGrnNumber(), materialType: '', materialCode: '', supplierName: '', poNumber: '', invoiceNumber: '', materialName: '', batchNo: '', manufacturer: '', receivedQuantity: '', containers: '', manufacturingDate: '', expiryDate: '', receivingDate: new Date().toISOString().slice(0, 10), storageRequirement: '', qcAssignedTo: '', remarks: '' });

export default function StockForm({ token, onNavigate = () => {} }) {
  const [showForm, setShowForm] = useState(false);
  const [listToast, setListToast] = useState('');
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [qcUsers, setQcUsers] = useState([]);
  const expirySoon = form.expiryDate && (new Date(form.expiryDate) - new Date()) / 86400000 <= 90;
  const availableMaterials = materialMaster.filter((material) => material.type === form.materialType);
  const update = (event) => setForm((values) => ({ ...values, [event.target.name]: event.target.value }));

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    warehouseApi.qcAssignees(token).then((data) => setQcUsers(data.users || [])).catch(() => setError('Unable to load QC users.'));
  }, [token]);

  function selectMaterialType(event) { setForm((values) => ({ ...values, materialType: event.target.value, materialCode: '', materialName: '' })); }
  function selectMaterial(event) {
    const material = materialMaster.find((item) => item.code === event.target.value);
    setForm((values) => ({ ...values, materialCode: material?.code || '', materialName: material?.name || '' }));
  }

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

  if (!showForm) return <WarehouseStock token={token} onNavigate={onNavigate} onCreate={() => setShowForm(true)} initialToast={listToast} />;

  return <section className="receiving-page">
    {toast && <div className="success-toast" role="status">✓ {toast}</div>}
    <div className="page-title"><div><h1>Material Receiving / Stock Form</h1><p>Record supplier material before it enters the warehouse workflow.</p></div><span className="stock-rule">Not available for normal stock or production</span></div>
    {error && <div className="stock-toast error-toast" role="alert">⚠ {error}</div>}
    <form className="receiving-form" onSubmit={submit}>
      <section className="receiving-card"><div className="card-heading"><div><p className="eyebrow">RECEIVING DETAILS</p><h3>Material and supplier information</h3></div><span className="grn-number">{form.grn} · Auto generated</span></div>
        <div className="receiving-fields">
          <label>GRN / Receiving No.<input value={form.grn} readOnly /></label><label>Type of Material<select name="materialType" value={form.materialType} onChange={selectMaterialType} required><option value="">Select material type</option>{materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label>Material Name / Unique Code<select name="materialCode" value={form.materialCode} onChange={selectMaterial} disabled={!form.materialType} required><option value="">{form.materialType ? 'Select material' : 'Select material type first'}</option>{availableMaterials.map((material) => <option key={material.code} value={material.code}>{material.name} ({material.code})</option>)}</select></label>
          <label>Supplier Name<input name="supplierName" value={form.supplierName} onChange={update} required /></label><label>PO Number<input name="poNumber" value={form.poNumber} onChange={update} required /></label><label>Invoice Number<input name="invoiceNumber" value={form.invoiceNumber} onChange={update} required /></label><label>Material Name<input value={form.materialName} readOnly placeholder="Selected from material list" /></label><label>Batch No.<input name="batchNo" value={form.batchNo} onChange={update} required /></label><label>Manufacturer<input name="manufacturer" value={form.manufacturer} onChange={update} required /></label>
          <label>Received Quantity<input name="receivedQuantity" type="number" min="0.001" step="any" value={form.receivedQuantity} onChange={update} required /></label><label>Number of Containers/Bags<input name="containers" type="number" min="1" step="1" value={form.containers} onChange={update} required /></label><label>Manufacturing Date<input name="manufacturingDate" type="date" value={form.manufacturingDate} onChange={update} required /></label><label>Expiry Date <small className={expirySoon ? 'expiry-warning' : ''}>{expirySoon ? 'Within 90 days' : 'Expiry notification enabled'}</small><input name="expiryDate" type="date" min={form.manufacturingDate || undefined} value={form.expiryDate} onChange={update} required /></label><label>Receiving Date<input name="receivingDate" type="date" value={form.receivingDate} onChange={update} required /></label><label>Storage Requirement<select name="storageRequirement" value={form.storageRequirement} onChange={update} required><option value="">Select requirement</option><option>Ambient / Room temperature</option><option>Cool (2–8°C)</option><option>Frozen (-20°C)</option><option>Protect from light</option><option>Dry storage</option></select></label><label>Assign QC reviewer<select name="qcAssignedTo" value={form.qcAssignedTo} onChange={update}><option value="">Select QC Test / QC Manager</option>{qcUsers.map((user) => <option key={user._id} value={user._id}>{user.name} — {user.role === 'admin' ? 'QC Manager' : 'QC Test'}</option>)}</select><small>Selected QC user will receive a notification.</small></label><label className="full-field">Remarks<textarea name="remarks" value={form.remarks} onChange={update} placeholder="Receiving observations or handling notes" /></label>
        </div>
      </section>
      <section className="receiving-card document-card"><div className="card-heading"><div><p className="eyebrow">DOCUMENT CHECK</p><h3>Upload and verify supplier documents</h3></div><span className="required-label">All documents required</span></div><p className="document-help">All four documents place the material in Quarantine. Any missing document places it on Document Hold.</p><div className="document-grid">{documentFields.map(([key, label]) => <label className="document-upload" key={key}><span>{label}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setDocuments((files) => ({ ...files, [key]: event.target.files[0] }))} /><small>{documents[key]?.name || 'No file selected'}</small></label>)}</div></section>
      <div className="receiving-actions"><button type="button" className="outline" onClick={() => setShowForm(false)}>Back to stock list</button><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Record Material Receipt'} <span>→</span></button></div>
    </form>
  </section>;
}
