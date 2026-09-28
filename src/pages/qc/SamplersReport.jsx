import { workflowApi } from '../../features/warehouse/workflowApi';
import SignaturePad from '../../components/SignaturePad';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { warehouseApi } from '../../features/warehouse/warehouseApi';
import './samplers-report.css';

const day = value => value ? String(value).slice(0, 10) : '';
const displayDay = value => day(value).split('-').reverse().join('/');
const today = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };
const stockFields = [['materialName', 'Material Name'], ['manufacturer', 'Manufacturer Name'], ['supplierName', 'Supplier Name'], ['arNumber', 'A.R Number'], ['batchNo', 'Vendor Batch No.'], ['manufacturingDate', 'Mfg. Date'], ['expiryDate', 'Expiry Date'], ['storageRequirement', 'Storage Condition'], ['containers', 'No. of containers Recd.'], ['containersSampled', 'No. of containers sampled'], ['receivedQuantity', 'Quantity Received'], ['quantityToBeSampled', 'Quantity to be Sampled'], ['quantitySampled', 'Quantity Sampled'], ['containerType', 'Container Type'], ['sealOfContainers', 'Seal of Containers'], ['packingConditions', 'Packing Conditions'], ['sampledByName', 'Sampling by (Name)'], ['samplingDate', 'Sampling Date']];
const editable = new Set(['arNumber', 'containersSampled', 'quantityToBeSampled', 'quantitySampled', 'containerType', 'sealOfContainers', 'packingConditions', 'sampledByName', 'samplingDate']);
const numeric = new Set(['containersSampled', 'quantityToBeSampled', 'quantitySampled']);

export default function SamplersReport({ record, token, user, onSaved = () => {}, samplingMode = false, onCancel = () => {}, onBusy = () => {} }) {
  const [mode, setMode] = useState('');
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const userId = String(user?.id || user?._id || '');
  const canEdit = user?.role === 'admin' || (user?.role === 'qc-test' && (!record.qcAssignedTo || String(record.qcAssignedTo?._id || record.qcAssignedTo) === userId));
  const existing = record.samplersReport;
  function open() {
    setError('');
    setValues({ ...record, arNumber: record.sampling?.number || '', containersSampled: record.sampling?.containers ?? '', quantityToBeSampled: record.sampling?.quantity ?? '', quantitySampled: record.sampling?.quantity ?? '', containerType: '', sealOfContainers: '', packingConditions: '', sampledByName: record.sampling?.sampledBy?.name || user?.name || '', samplingDate: day(record.sampling?.samplingDate) || today(), remarks: '', ...existing, ...(existing ? { samplingDate: day(existing.samplingDate) } : {}) });
    setMode(samplingMode ? 'form' : existing ? 'view' : 'form');
  }
  useEffect(() => { if (samplingMode) open(); }, [record._id, samplingMode]);
  function edit() {
    setValues(current => ({ ...current, ...Object.fromEntries(stockFields.filter(([key]) => !editable.has(key)).map(([key]) => [key, record[key]])), ...(record.sampling?.number ? { arNumber: record.sampling.number, containersSampled: record.sampling.containers, quantitySampled: record.sampling.quantity, samplingDate: day(record.sampling.samplingDate) } : {}) }));
    setMode('form'); setError('');
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); onBusy(true); setError('');
    try {
      const payload = Object.fromEntries([...editable, 'remarks', 'signatureImage'].map(key => [key, values[key]]));
      if (samplingMode) {
        const data = await workflowApi.post(token, `raw/${record._id}/sampling`, { quantity: values.quantitySampled, containers: values.containersSampled, samplingDate: values.samplingDate, sampledBy: user.id || user._id, remarks: values.remarks, revision: record.__v ?? 0, samplersReport: payload });
        onSaved(data.record); return;
      }
      const { report, revision } = await warehouseApi.saveSamplersReport(token, record._id, { ...payload, revision: record.__v ?? 0 });
      onSaved({ ...record, samplersReport: report, __v: revision });
      setValues({ ...report, samplingDate: day(report.samplingDate) });
      setMode('view'); setMessage('Samplers Report saved with this stock record.');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); onBusy(false); }
  }
  const close = () => { if (!busy) { setMode(''); setError(''); if (samplingMode) onCancel(); } };
  const lockedSampling = new Set(samplingMode ? ['arNumber', 'sampledByName'] : record.sampling?.number ? ['arNumber', 'containersSampled', 'quantitySampled', 'samplingDate'] : []);
  const renderDialog = content => samplingMode ? content : createPortal(content, document.body);
  return <section className={samplingMode ? 'sampling-report-inline' : 'samplers-report-link'}>{!samplingMode && <><h4>Samplers Report</h4>{existing && <p>Saved {new Date(existing.savedAt).toLocaleString()} by {existing.recordedByName} · A.R. {existing.arNumber}</p>}{message && <p role="status">{message}</p>}
    {(canEdit || existing) ? <button type="button" className="primary" onClick={() => { setMode('confirm'); setMessage(''); }}>Samplers Report{existing ? ' · Saved' : ''}</button> : <p>No samplers report saved yet.</p>}
    </>}
    {mode && renderDialog(<div className={samplingMode ? 'sampling-inline-container' : 'samplers-backdrop'} onMouseDown={samplingMode ? undefined : close}><section role="dialog" aria-modal="true" aria-label={mode === 'confirm' ? 'Open Samplers Report?' : 'Samplers Report'} className={samplingMode ? 'sampling-inline-paper' : 'samplers-modal'} onMouseDown={event => event.stopPropagation()}>
      <button type="button" className="modal-close" aria-label="Close samplers report" disabled={busy} onClick={close}>×</button>
      {mode === 'confirm' ? <><h3>Open Samplers Report?</h3><p>For {record.grnNumber} — {record.materialName}, batch {record.batchNo}.</p><div className="samplers-actions"><button type="button" className="primary" onClick={open}>Yes</button><button type="button" className="outline" onClick={close}>No</button></div></> : <form onSubmit={save}>
        <div className="samplers-paper"><header><img src="/protech-biopharma-logo.jpeg" alt="Protech Biopharma" /><div><h2>Protech Biopharma Pvt. Ltd.</h2><p>Plot No. 4/48 I &amp; 4/49 I, Zone-I, SIDCO Industrial Growth Centre, Lassipora, Pulwama Pin-192305 (J&amp;K) INDIA</p><b>Annexure-I</b></div><small>Page 1 of 1</small></header><p className="samplers-format">Format No.: SOP/QC/027/F01-01</p><h3>Title: Samplers Report</h3><p>Stock reference: {record.grnNumber}</p>
          <div className="samplers-rows">{stockFields.map(([key, label]) => <label key={key}><span>{label}</span>{mode === 'form' && editable.has(key) ? <input aria-label={label} required type={key === 'samplingDate' ? 'date' : numeric.has(key) ? 'number' : 'text'} value={samplingMode && key === 'arNumber' ? 'Assigned on save' : samplingMode && key === 'sampledByName' ? user.name || user.email : values[key] ?? ''} readOnly={lockedSampling.has(key)} disabled={busy} min={numeric.has(key) ? key === 'containersSampled' ? 1 : 0.000001 : key === 'samplingDate' ? day(record.receivingDate) : undefined} max={key === 'containersSampled' ? record.containers : numeric.has(key) ? record.receivedQuantity : key === 'samplingDate' ? today() : undefined} step={key === 'containersSampled' ? 1 : 'any'} maxLength={1000} onChange={event => setValues(current => ({ ...current, [key]: event.target.value }))} /> : <span>{key.endsWith('Date') ? displayDay(values[key]) : values[key] ?? ''}{['receivedQuantity', 'quantityToBeSampled', 'quantitySampled'].includes(key) ? ` ${values.quantityUnit || record.quantityUnit || ''}` : ''}</span>}</label>)}</div>
          <label className="samplers-remarks">Remarks:{mode === 'form' ? <textarea value={values.remarks ?? ''} maxLength={2000} disabled={busy} onChange={event => setValues(current => ({ ...current, remarks: event.target.value }))} /> : <p>{values.remarks || '—'}</p>}</label><SignaturePad label="Signature" value={values.signatureImage || ''} disabled={busy} onChange={mode === 'form' ? signatureImage => setValues(current => ({ ...current, signatureImage })) : undefined} /><p>Signature Date: {displayDay(values.samplingDate)}</p>
        </div>
        {error && <p role="alert" className="error-toast">{error}</p>}{message && <p role="status">{message}</p>}
        <div className="samplers-actions">{mode === 'form' && canEdit && <button className="primary" type="submit" disabled={busy}>{busy ? 'Saving...' : samplingMode ? 'Save Sampling Details' : 'Save Samplers Report'}</button>}{mode === 'view' && canEdit && <button type="button" className="primary" onClick={edit}>Edit report</button>}<button className="outline" type="button" disabled={busy} onClick={close}>Close</button></div>
      </form>}
    </section></div>)}
  </section>;
}
