import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../../features/warehouse/workflowApi';
import { Field, Documents } from './WorkflowComponents';

const today = () => new Date().toISOString().slice(0, 10);
const emptyTest = () => ({ testName: '', specification: '', requiredLimit: '', actualResult: '', testMethod: '', result: '', testDate: today(), remarks: '' });
const actions = {
  editDispatch: (id) => `dispatches/${id}/quantity`,
  sampling: (id) => `raw/${id}/sampling`, tests: (id) => `raw/${id}/tests`, decision: (id) => `raw/${id}/decision`, acceptRaw: (id) => `raw/${id}/accept`,
  requisition: () => 'requisitions', dispense: (id) => `requisitions/${id}/dispense`, receive: (id) => `requisitions/${id}/receive`, resolve: (id) => `requisitions/${id}/resolve`,
  fg: () => 'fg', submitFg: (id) => `fg/${id}/submit`, acceptFg: (id) => `fg/${id}/accept`, dispatch: () => 'dispatches', confirmDispatch: (id) => `dispatches/${id}/confirm`,
};
async function allRecords(token, kind, status) {
  const records = [];
  let page = 1, totalPages = 1;
  do { const data = await workflowApi.get(token, `records/${kind}`, { status, page }); records.push(...data.records); totalPages = data.pagination.totalPages; page++; } while (page <= totalPages);
  return records;
}

export default function WorkflowAction({ action, record, token, user, lookups, onSaved, onCancel, onBusy }) {
  const [values, setValues] = useState({ samplingDate: today(), sampledBy: user.id || user._id, quantity: action === 'acceptFg' ? record.quantity : '', containers: '', quantityUnit: 'Nos', testDate: today(), manufacturingDate: today(), dispatchDate: today(), sourceRequisitions: [], documentKind: action === 'uploadFg' ? 'FG Documents' : 'Test Report (COA)', decision: 'Accept', status: 'Approved' });
  const [tests, setTests] = useState(() => record?.qc?.tests?.length ? record.qc.tests.map((test) => ({ ...test, testDate: test.testDate?.slice(0, 10) })) : [emptyTest()]);
  const [options, setOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [qcFiles, setQcFiles] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    let active = true;
    const work = action === 'dispense' ? workflowApi.get(token, 'batches', { materialCode: record.materialCode, quantityUnit: record.quantityUnit }).then((data) => data.records)
      : action === 'fg' ? allRecords(token, 'requisition', 'Completed') : action === 'dispatch' ? allRecords(token, 'fg', 'Available') : null;
    if (work) { setLoading(true); work.then((records) => { if (active) setOptions(records); }).catch((error) => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); }); }
    return () => { active = false; };
  }, [action, token, record?._id]);

  const field = (key, label, type = 'text', extra = {}) => <Field key={key} label={label} type={type} value={values[key] ?? ''} onChange={(value) => update(key, value)} {...extra} />;
  const quantity = (label = 'Quantity') => field('quantity', label, 'number', { min: '0.000001', step: '0.000001' });
  const remarks = (required = false) => field('remarks', 'Remarks', 'textarea', { required });
  const locations = lookups.locations.map((location) => ({ value: location.name, label: location.name }));
  const issues = (record?.issues || []).filter((issue) => issue.status === (action === 'resolve' ? 'Discrepancy' : 'Sent to Production'));
  const selectedIssue = issues.find((issue) => issue._id === values.issueId);
  const selectedFg = options.find((item) => item._id === values.fgReceipt);
  const dispensedQuantity = (record?.issues || []).reduce((sum, issue) => sum + issue.quantity, 0);
  const remainingQuantity = Math.round(((record?.quantity || 0) - dispensedQuantity) * 1e6) / 1e6;

  async function submit(event) {
    event.preventDefault(); setBusy(true); onBusy(true); setError('');
    try {
      if (action === 'tests' && tests.some((test) => test.remarks.trim().split(/\s+/).filter(Boolean).length > 250)) throw new Error('Test remarks must not exceed 250 words.');
      let path, payload = action === 'editDispatch' ? { ...values, previousQuantity: record.quantity } : values;
      if (action.startsWith('upload')) {
        path = `documents/${action === 'uploadQc' ? 'qc' : 'fg'}/${record._id}`;
        const uploads = action === 'uploadQc' ? Object.entries(qcFiles).flatMap(([kind, items]) => items.map((file) => ({ kind, file }))) : files.map((file) => ({ kind: 'FG Documents', file }));
        if (!uploads.length) throw new Error('Select at least one file to upload.');
        if (uploads.length > 5) throw new Error('Upload up to five files at a time.');
        if (uploads.some(({ file }) => file.size > 10 * 1024 * 1024)) throw new Error('Each file must be 10 MB or smaller.');
        payload = new FormData();
        payload.append('documentKinds', JSON.stringify(uploads.map(({ kind }) => kind)));
        uploads.forEach(({ file }) => payload.append('files', file));
      } else if (action === 'adjust') path = `stock/${record.grnNumber ? 'raw' : 'fg'}/${record._id}/adjust`;
      else { path = actions[action](record?._id); if (action === 'tests') payload = { tests }; }
      const data = await workflowApi.post(token, path, payload);
      onSaved(data.record);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); onBusy(false); }
  }

  return <form onSubmit={submit} className="flow-action-form">
    {record && <div className="flow-note"><b>{record.grnNumber || record.number} · {record.materialName}</b><p>Batch {record.batchNo || 'not allocated yet'} · {record.receivedQuantity || record.quantity} {record.quantityUnit}</p></div>}
    {loading && <p role="status">Loading available records...</p>}
      <fieldset disabled={busy || loading} className="profile-fields"><div className="flow-form-grid">
        {action === 'editDispatch' && <><div className="flow-note"><b>Current requested quantity: {record.quantity} {record.quantityUnit}</b><p>Available FG stock: {record.fgReceipt?.availableQuantity ?? 'Checked at dispatch confirmation'} {record.quantityUnit}.</p><p>This changes the pending request only. Warehouse checks available stock and expiry when confirming dispatch.</p></div>{quantity('New dispatch quantity')}{field('reason', 'Quantity change reason', 'textarea')}</>}
        {action === 'dispatch' && <><Field label="Dispatch number" value="Auto-generated on submission (DIS-)" readOnly onChange={() => {}} />{selectedFg && <div className="flow-note"><b>{selectedFg.materialName} / {selectedFg.batchNo}</b><p>Available: {selectedFg.availableQuantity} {selectedFg.quantityUnit}. Expiry: {selectedFg.expiryDate?.slice(0, 10)}.</p><p>Storage location: {selectedFg.location}. Warehouse checks the latest balance again when confirming dispatch.</p></div>}{!loading && !options.some((item) => item.availableQuantity > 0 && new Date(item.expiryDate) > new Date()) && <p role="status">No unexpired FG stock is available. Complete Warehouse FG Receiving before creating a dispatch request.</p>}</>}
        {action === 'acceptFg' && <div className="flow-note"><b>Required documents for physical verification</b><Documents documents={record.documents || []} />{record.discrepancyReason && <p>Previous discrepancy: {record.discrepancyReason}</p>}</div>}
        {action === 'dispense' && <div className="flow-note"><p><b>Already dispensed:</b> {dispensedQuantity} {record.quantityUnit} | <b>Still required:</b> {remainingQuantity} {record.quantityUnit}</p>{record.issues.map((issue) => <p key={issue._id}>{issue.number}: {issue.quantity} {record.quantityUnit} from batch {issue.batchNo} — {issue.status}</p>)}{!loading && !error && !options.length && <p role="status">No selectable batch has stock remaining. Receive and complete QC approval and Warehouse acceptance for additional stock, then reopen dispensing. Production can receive any delivery already sent from its Receive Material page.</p>}</div>}
        {action === 'receive' && <div className="flow-note"><b>{record.number}: {record.materialName} ({record.materialCode})</b><p>Production order / batch: {record.productionOrder}. Requested: {record.quantity} {record.quantityUnit}.</p>{selectedIssue && <><p>Dispensing: {selectedIssue.number} | Batch: {selectedIssue.batchNo} | Sent: {selectedIssue.quantity} {record.quantityUnit}</p>{values.actualQuantity !== '' && Number.isFinite(Number(values.actualQuantity)) && <p>Difference (received - sent): {Math.round((Number(values.actualQuantity) - selectedIssue.quantity) * 1e6) / 1e6} {record.quantityUnit}</p>}</>}<p>Check material, batch, quantity and container / packing against the physical delivery. Use Discrepancy for any mismatch. This confirmation does not change warehouse stock.</p></div>}
        {action === 'fg' && <div className="flow-note"><b>Finished goods handover</b><p>1. Create this entry and link the completed requisitions used in manufacturing.</p><p>2. Upload the required FG documents.</p><p>3. Submit the handover to notify Warehouse. Stock becomes available only after Warehouse acceptance.</p>{!loading && !options.length && <p>No completed requisitions found. Complete production receiving before creating an FG handover.</p>}</div>}
        {action === 'acceptFg' && <div className="flow-note"><b>{record.number}: {record.materialName} / {record.batchNo}</b><p>Manufactured: {record.quantity} {record.quantityUnit}. MFG: {record.manufacturingDate?.slice(0, 10)}. Expiry: {record.expiryDate?.slice(0, 10)}.</p><p>Check packing, documents and physical condition. Record any discrepancy before accepting stock. A reduced accepted quantity requires an explanation.</p>{!locations.length && <p>Add a storage location from Warehouse / Location before accepting.</p>}</div>}
        {action === 'confirmDispatch' && <div className="flow-note"><b>{record.number}: {record.materialName} / {record.batchNo}</b><p>Dispatch: {record.quantity} {record.quantityUnit} to {record.customer}.</p><p>Sales order / invoice: {record.salesOrder}. Destination: {record.destination}.</p><p>Current FG balance: {record.fgReceipt?.availableQuantity ?? 'Checked on confirmation'} {record.quantityUnit}. Expiry: {record.fgReceipt?.expiryDate?.slice(0, 10) || 'Checked on confirmation'}.</p><p>Confirmation checks the latest stock balance and expiry, deducts stock once, and marks this dispatch as Dispatched.</p></div>}
        {action === 'acceptRaw' && <div className="flow-note"><b>Warehouse acceptance: {record.materialName} ({record.materialCode})</b><p>Batch {record.batchNo}: {record.receivedQuantity} {record.quantityUnit}</p><p>QC approval confirms quality only. Select a location and confirm physical verification to make this quantity available.</p>{!locations.length && <p role="alert">No storage locations found. Close this popup and use Manage locations to add a location before accepting.</p>}</div>}
        {action === 'requisition' && <Field label="Requisition number" value="Auto-generated on submission (MR-)" readOnly onChange={() => {}} />}
        {action === 'dispense' && <div className="flow-note"><b>{record.number}: {record.materialName} ({record.materialCode})</b><p>Requested: {record.quantity} {record.quantityUnit}</p><p>Available stock: {options.reduce((sum, item) => sum + item.availableQuantity, 0)} {record.quantityUnit}</p><p>Dispensing number is automatically generated on confirmation (DSP-).</p>{!loading && !options.length && <p role="alert">No accepted, unexpired batches are available for this material.</p>}</div>}
      {action === 'sampling' && <><Field label="Material / batch" type="select" value={record._id} onChange={() => {}} options={[{ value: record._id, label: `${record.materialName} / ${record.batchNo}` }]} /><Field label="Sample number" value="Auto-generated on save (A0001?)" readOnly onChange={() => {}} />{field('samplingDate', 'Sampling date', 'date', { max: today() })}{quantity('Sample quantity')}{field('containers', 'Containers sampled', 'number', { min: 1, max: record.containers, step: 1 })}{field('sampledBy', 'Sampled by', 'select', { options: lookups.qcUsers.map((person) => ({ value: person._id, label: person.name })) })}{field('remarks', 'Sampling remarks', 'textarea', { required: false })}</>}
      {action === 'decision' && <><div className="flow-note"><b>Saved QC results: {record.qc?.tests?.length || 0}</b><p>Batch: {record.batchNo} ? Sample: {record.sampling?.number || 'Not recorded'}</p>{record.qc?.tests?.map((test, index) => <p key={test._id || index}>{test.testName}: {test.result}</p>)}{['Test Report (COA)', 'Supporting Documents'].map((kind) => <p key={kind}>{kind}: {(record.qc?.documents || []).some((document) => document.kind === kind && document.fileUrl) ? 'Uploaded' : 'Missing ? add a file under this category in Upload QC documents'}</p>)}</div>{field('status', 'QC decision', 'select', { options: [{ value: 'Approved', label: 'PASS — QC Approved' }, { value: 'Rejected', label: 'FAIL — QC Rejected' }, { value: 'Hold', label: 'INVESTIGATION — QC Hold' }] })}{field('note', 'Decision reason / remarks', 'textarea', { required: values.status !== 'Approved' })}<p>Approval uses the saved passing test results for this batch. A separate QC Result file is optional. Sampling, Test Report (COA) and Supporting Documents are still required. Approved batches require warehouse acceptance.</p></>}
      {action === 'acceptRaw' && <>{field('location', 'Storage location', 'select', { options: locations })}{remarks()}<p>Accept the complete received quantity into approved raw material stock after checking material, batch, quantity, documents, dates and physical condition.</p></>}
      {action === 'requisition' && <><Field label="Material" type="select" value={values.materialCode ? `${values.materialCode}|${values.quantityUnit}` : ''} onChange={(value) => { const material = lookups.materials.find((item) => `${item.materialCode}|${item.quantityUnit}` === value); setValues((current) => ({ ...current, materialCode: material?.materialCode, quantityUnit: material?.quantityUnit })); }} options={lookups.materials.map((material) => ({ value: `${material.materialCode}|${material.quantityUnit}`, label: `${material.materialName} (${material.materialCode}) · ${material.quantityUnit}` }))} />{field('productionOrder', 'Production order / batch number')}{quantity('Required quantity')}{remarks()}<p>Submitting a request does not reserve or deduct stock.</p></>}
      {action === 'dispense' && <>{field('receiptId', 'Approved batch (earliest expiry first)', 'select', { options: options.map((item) => ({ value: item._id, label: `${item.batchNo} · ${item.availableQuantity} ${item.quantityUnit} · ${item.verification?.location} · expiry ${item.expiryDate?.slice(0, 10)}` })) })}{quantity('Actual dispensing quantity')}<p>Remaining request: {Math.round((record.quantity - record.issues.reduce((sum, issue) => sum + issue.quantity, 0)) * 1e6) / 1e6} {record.quantityUnit}. Only confirmed dispensing reduces stock.</p></>}
      {action === 'receive' && <>{field('issueId', 'Dispensing number', 'select', { options: issues.map((issue) => ({ value: issue._id, label: `${issue.number} · ${issue.batchNo} · ${issue.quantity} ${record.quantityUnit}` })) })}{field('decision', 'Receipt decision', 'select', { options: ['Accept', 'Discrepancy'] })}{field('actualQuantity', 'Actual quantity received', 'number', { min: 0, step: '0.000001' })}{field('reason', 'Discrepancy reason', 'textarea', { required: values.decision === 'Discrepancy' })}{remarks()}<p>Check material code, name, batch, quantity, containers, requisition and dispensing number. Confirmation does not change warehouse stock.</p></>}
      {action === 'resolve' && <>{field('issueId', 'Dispensing discrepancy', 'select', { options: issues.map((issue) => ({ value: issue._id, label: `${issue.number} · difference ${issue.differenceQuantity}` })) })}{field('reason', 'Resolution / corrective action', 'textarea')}<p>This closes the discrepancy and preserves its original details. Any physical stock correction requires a separate administrator adjustment.</p></>}
      {action === 'fg' && <>{field('materialCode', 'FG code')}{field('materialName', 'FG name')}{field('batchNo', 'FG batch number')}{quantity('Manufactured quantity')}{field('quantityUnit', 'Quantity unit')}{field('manufacturingDate', 'Manufacturing date', 'date', { max: today() })}{field('expiryDate', 'Expiry date', 'date')}{field('sourceRequisitions', 'Completed source requisitions (select all used)', 'multiselect', { options: options.map((item) => ({ value: item._id, label: `${item.number} · ${item.productionOrder} · ${item.materialName}` })) })}{remarks()}<p>After creating the handover, attach the required documents and submit it for warehouse verification.</p></>}
      {action === 'acceptFg' && <>{field('decision', 'Verification decision', 'select', { options: ['Accept', 'Discrepancy'] })}{values.decision === 'Accept' ? <>{quantity('Accepted quantity')}{field('location', 'Storage location', 'select', { options: locations })}{remarks(Number(values.quantity) !== record.quantity || record.status === 'Discrepancy')}</> : field('reason', 'Discrepancy reason', 'textarea')}<p>Check packing, documents, dates and physical condition. Explain any quantity difference before acceptance.</p></>}
      {action === 'dispatch' && <>{field('fgReceipt', 'Available FG batch', 'select', { options: options.filter((item) => item.availableQuantity > 0 && new Date(item.expiryDate) > new Date()).map((item) => ({ value: item._id, label: `${item.materialName} / ${item.batchNo} · ${item.availableQuantity} ${item.quantityUnit} · ${item.location}` })) })}{field('customer', 'Customer')}{field('salesOrder', 'Sales order / invoice')}{quantity('Required dispatch quantity')}{field('dispatchDate', 'Dispatch date', 'date')}{field('destination', 'Destination')}{remarks()}<p>The request does not deduct stock. Warehouse must confirm dispatch.</p></>}
      {action === 'uploadQc' && <>{['Test Report (COA)', 'QC Result', 'Supporting Documents'].map((kind) => {
        const existing = (record.qc?.documents || []).filter((document) => document.kind === kind && document.fileUrl);
        return <label className="flow-field" key={kind}>{kind} {kind === 'QC Result' ? '(optional: saved tests count)' : '(required for approval)'}
          <small>{existing.length ? existing.length + ' file(s) already uploaded' : 'No files uploaded in this category'}</small>
          {existing.map((document, index) => <a key={document._id || index} href={document.fileUrl} target="_blank" rel="noreferrer">{document.fileName}</a>)}
          <input type="file" multiple onChange={(event) => setQcFiles((current) => ({ ...current, [kind]: [...event.target.files] }))} />
          <small>{(qcFiles[kind] || []).map((file) => file.name).join(', ')}</small>
        </label>;
      })}<p>PDF, images and other file formats accepted. Up to five files total per upload, 10 MB per file. Previously uploaded documents are retained.</p></>}
      {action === 'uploadFg' && <label className="flow-field">FG documents<input type="file" multiple required onChange={(event) => setFiles([...event.target.files])} /><small>Any file format. Up to five files, 10 MB each.</small></label>}
      {action === 'adjust' && <>{field('quantity', 'Adjustment (+ add / − subtract)', 'number', { step: '0.000001' })}{field('reason', 'Reason and source reference', 'textarea')}<p>Current available quantity: {record.availableQuantity} {record.quantityUnit}. A permanent audit entry records the adjustment.</p></>}
    </div>
    {action === 'tests' && <><p>QC analyst: {user.name} · ID {user.id || user._id}. All changes are retained in the audit trail.</p>{tests.map((test, index) => <section className="flow-test" key={index}><div className="card-heading"><h4>Test {index + 1}</h4><button className="outline" type="button" disabled={tests.length === 1} onClick={() => setTests((current) => current.filter((_, row) => row !== index))}>Remove row</button></div><div className="flow-form-grid">{['testName', 'specification', 'requiredLimit', 'actualResult', 'testMethod', 'result', 'testDate', 'remarks'].map((key) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')} type={key === 'result' ? 'select' : key === 'testDate' ? 'date' : key === 'remarks' ? 'textarea' : 'text'} value={test[key]} options={['Pass', 'Fail']} required={key !== 'remarks'} onChange={(value) => setTests((current) => current.map((item, row) => row === index ? { ...item, [key]: value } : item))} />)}</div><small>{test.remarks.trim().split(/\s+/).filter(Boolean).length}/250 words in remarks</small></section>)}<button className="outline" type="button" onClick={() => setTests((current) => [...current, emptyTest()])}>+ Add test</button></>}
    {['acceptRaw', 'dispense', 'receive', 'acceptFg', 'confirmDispatch'].includes(action) && <label className="flow-confirm"><input type="checkbox" required checked={Boolean(values.verified)} onChange={(event) => update('verified', event.target.checked)} />{action === 'acceptFg' ? 'I have checked FG name, batch, quantity, manufacturing date, expiry date, packing, documents and physical condition.' : action === 'confirmDispatch' ? 'I have checked FG stock, batch, available quantity, expiry, dispatch quantity and customer details.' : 'I have physically verified the material, batch, quantity, packing and required documents.'}</label>}
    {action === 'submitFg' && <p>Submit this handover and its documents to Warehouse for physical verification. It will remain outside available stock until accepted.</p>}
    {action === 'confirmDispatch' && <p>Confirm dispatch of {record.quantity} {record.quantityUnit} to {record.customer}. This deducts finished goods stock immediately.</p>}
    <div className="flow-buttons"><button className="outline" type="button" onClick={onCancel}>Cancel</button><button className="primary" type="submit" disabled={action === 'dispense' && (!options.length || !values.receiptId)}>{busy ? 'Saving...' : action === 'sampling' ? 'Record collection & start testing' : action === 'confirmDispatch' ? 'Confirm dispatch' : 'Save & confirm'}</button></div>
    </fieldset>{error && <p className="form-message error" role="alert">{error}</p>}
  </form>;
}
