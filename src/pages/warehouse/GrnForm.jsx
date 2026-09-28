import SignaturePad from '../../components/SignaturePad';
import { warehouseApi } from '../../features/warehouse/warehouseApi';
import React, { useState } from 'react';
import { materialTypes } from '../../data/materialMaster';
import './grn.css';

export const grnSections = [
  ['Material Status', [
    ['materialName', 'Description', 'text', true], ['invoiceNumber', 'Invoice No.', 'text', true],
    ['batchNo', 'Batch No.', 'text', true], ['grnDate', 'GRN Date', 'date'],
    ['manufacturingDate', 'Mfg. Date', 'date', true], ['grnNumber', 'GRN No.', 'text', true],
    ['expiryDate', 'Exp. Date', 'date', true], ['transport', 'Transport'],
    ['packSize', 'Pack Size'], ['lrNumber', 'LR No.'],
    ['receivedQuantity', 'Total Qty.', 'number', true], ['inwardType', 'Inward Type'],
    ['poNumber', 'PO No.', 'text', true], ['manufacturer', 'Make', 'text', true],
    ['poDate', 'PO Date', 'date'], ['supplierName', 'Supplier Name', 'text', true],
    ['vendorCode', 'Vendor Code'], ['receivingDate', 'Date of Receipt', 'date', true],
  ]],
  ['GST Details', [['hsnCode', 'HSN Code'], ['purchaseFrom', 'Purchase From'], ['gstNumber', 'GST No.'], ['state', 'State'], ['gstAmount', 'GST Amount', 'number'], ['gstRate', 'GST Rate', 'rate']]],
  ['Bill Details', [['orderQuantity', 'Order Qty.', 'number'], ['pendingQuantity', 'Pending Qty. / Not applicable'], ['billAmount', 'Bill Amount', 'number'], ['paymentTerms', 'Terms of Payment']]],
  ['Warehouse Details', [['materialType', 'Material Type', 'material', true], ['materialCode', 'Material Code', 'text', true], ['quantityUnit', 'Quantity Unit', 'text', true], ['containers', 'Number of Containers', 'number', true], ['storageRequirement', 'Storage Requirement', 'text', true], ['remarks', 'Remarks']]],
];
export const grnFields = grnSections.flatMap(([, fields]) => fields);
const today = () => { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-'); };
export const newGrn = () => ({ ...Object.fromEntries(grnFields.map(([key]) => [key, ''])), receivingDate: today(), grnDate: today(), quantityUnit: 'Kg' });
const date = value => value ? String(value).slice(0, 10) : '';
export const editGrn = record => Object.fromEntries(grnFields.map(([key, , type]) => [key, type === 'date' ? date(record[key]) : record[key] ?? '']));

export function GrnHeader() {
  return <header className="grn-header"><div className="grn-company"><img src="/protech-biopharma-logo.jpeg" alt="Protech Biopharma" /><div><h2>Protech Biopharma Pvt. Ltd.</h2><p>Plot No. 4/48 I &amp; 4/49 I, Zone-I, SIDCO Industrial Growth Centre, Lassipora, Pulwama Pin-192305 (J&amp;K) INDIA</p></div></div><div className="grn-meta"><span><b>Format No.:</b> SOP/WH/009/F02-03</span><span><b>Effective Date:</b> 11/07/2026</span></div><h3>Goods Received Note</h3></header>;
}

export function GrnFields({ values, onChange }) {
  return <div className="grn-sections">{grnSections.map(([title, fields]) => <section className={`grn-section ${title === 'Warehouse Details' ? 'grn-warehouse' : ''} ${['GST Details', 'Bill Details'].includes(title) ? 'grn-financial' : ''}`} key={title}><h3>{title}</h3><div className="grn-fields">{fields.map(([key, label, type = 'text', required]) => <label key={key}>{label}{required && ' *'}{['rate', 'material'].includes(type) ? <select name={key} value={values[key]} onChange={onChange} required={required}><option value="">Select</option>{(type === 'rate' ? [18, 12, 5] : materialTypes).map(value => <option key={value} value={value}>{value}{type === 'rate' ? '%' : ''}</option>)}</select> : <input name={key} type={type} value={values[key]} onChange={onChange} required={required} min={type === 'number' ? (key === 'containers' ? 1 : key === 'receivedQuantity' ? 0.000001 : 0) : undefined} step={key === 'containers' ? 1 : 'any'} />}</label>)}</div></section>)}</div>;
}

export function GrnQc({ record = {}, onSignatureChange, disabled }) {
  const name = value => value?.name || '';
  const test = label => record.qc?.tests?.find(item => item.testName?.toLowerCase() === label.toLowerCase())?.actualResult;
  const fields = [['Sampled By', name(record.sampling?.sampledBy)], ['Sampled Qty.', record.sampling?.quantity], ['Inner Packing', test('Inner Packing')], ['Container Sampled', record.sampling?.containers], ['A.R. No.', record.sampling?.number], ['A.R. Date', date(record.sampling?.samplingDate)], ['Status', record.qc?.decision], ['Assay', test('Assay')], ['LOD/ Moisture', test('LOD/ Moisture')], ['Analyst By', name(record.qc?.tests?.[0]?.analyst)], ['Dimensions', test('Dimensions')], ['Thickness', test('Thickness')], ['Grammage', test('Grammage')], ['Color Scheme', test('Color Scheme')], ['Capacity', test('Capacity')], ['PH', test('PH')], ['Qty. Approved', record.qc?.decision === 'Approved' ? record.receivedQuantity : undefined], ['Partly Qty. Rejected', test('Partly Qty. Rejected')], ['Approved By', name(record.qc?.decisionBy)]];
  return <><section className="grn-section"><h3>Q.C. Testing</h3><p className="grn-help">Completed through the QC sampling and testing workflow.</p><dl className="grn-qc">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? ''}</dd></div>)}</dl></section><div className="grn-signatures">{[['preparedSignature', 'Prepared By'], ['checkedSignature', 'Checked By'], ['approvedSignature', 'Approved By']].map(([key, label]) => <SignaturePad key={key} label={label} value={record[key] || ''} disabled={disabled} onChange={onSignatureChange ? value => onSignatureChange(key, value) : undefined} />)}</div></>;
}

export function GrnRecord({ record, token, user, onSaved }) {
  const [images, setImages] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canDraw = token && onSaved && (['warehouse', 'admin'].includes(user?.role) || (user?.role === 'qc-test' && (!record.qcAssignedTo || String(record.qcAssignedTo?._id || record.qcAssignedTo) === String(user.id || user._id))));
  async function saveImages() {
    setBusy(true); setError(''); setMessage('');
    try { const data = await warehouseApi.saveSignatureImages(token, record._id, { ...images, revision: record.__v ?? 0 }); onSaved({ ...record, ...data.images, __v: data.revision }); setImages({}); setMessage('Signature images saved with this stock.'); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <div className="grn-sheet"><GrnHeader /><div className="grn-sections">{grnSections.map(([title, fields]) => <section className="grn-section" key={title}><h3>{title}</h3><dl className="grn-values">{fields.map(([key, label, type]) => <div key={key}><dt>{label}</dt><dd>{type === 'date' ? date(record[key]) : record[key] ?? ''}{key === 'gstRate' && record[key] != null ? '%' : ''}{['receivedQuantity', 'orderQuantity'].includes(key) && record[key] != null ? ' ' + (record.quantityUnit || '') : ''}</dd></div>)}</dl></section>)}</div><GrnQc record={{ ...record, ...images }} disabled={busy} onSignatureChange={canDraw ? (key, value) => { setImages(current => ({ ...current, [key]: value })); setMessage(''); } : undefined} /><div className="signature-tools">{canDraw && Object.keys(images).length > 0 && <button type="button" className="primary" disabled={busy} onClick={saveImages}>{busy ? 'Saving...' : 'Save signatures'}</button>}{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}</div></div>;
}
