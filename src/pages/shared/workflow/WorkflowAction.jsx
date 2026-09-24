import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../../features/warehouse/workflowApi';
import { Field } from './WorkflowComponents';

const today = () => new Date().toISOString().slice(0, 10);
const emptyTest = () => ({ testName: '', specification: '', requiredLimit: '', actualResult: '', testMethod: '', result: '', testDate: today(), remarks: '' });
const actions = {
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

  async function submit(event) {
    event.preventDefault(); setBusy(true); onBusy(true); setError('');
    try {
      let path, payload = values;
      if (action.startsWith('upload')) {
        path = `documents/${action === 'uploadQc' ? 'qc' : 'fg'}/${record._id}`;
        payload = new FormData(); payload.append('documentKind', values.documentKind); files.forEach((file) => payload.append('files', file));
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
      {action === 'sampling' && <><Field label="Material / batch" type="select" value={record._id} onChange={() => {}} options={[{ value: record._id, label: `${record.materialName} / ${record.batchNo}` }]} /><Field label="Sample number" value="Auto-generated on collection" readOnly onChange={() => {}} />{field('samplingDate', 'Sampling date', 'date', { max: today() })}{quantity('Sample quantity')}{field('containers', 'Containers sampled', 'number', { min: 1, max: record.containers, step: 1 })}{field('sampledBy', 'Sampled by', 'select', { options: lookups.qcUsers.map((person) => ({ value: person._id, label: person.name })) })}{remarks()}</>}
      {action === 'decision' && <>{field('status', 'QC decision', 'select', { options: [{ value: 'Approved', label: 'PASS — QC Approved' }, { value: 'Rejected', label: 'FAIL — QC Rejected' }, { value: 'Hold', label: 'INVESTIGATION — QC Hold' }] })}{field('note', 'Decision reason / remarks', 'textarea', { required: values.status !== 'Approved' })}<p>Approval requires sampling, all passing tests and all three QC document categories. Approved batches still require warehouse acceptance.</p></>}
      {action === 'acceptRaw' && <>{field('location', 'Storage location', 'select', { options: locations })}{remarks()}<p>Accept the complete received quantity into approved raw material stock after checking material, batch, quantity, documents, dates and physical condition.</p></>}
      {action === 'requisition' && <><Field label="Material" type="select" value={values.materialCode ? `${values.materialCode}|${values.quantityUnit}` : ''} onChange={(value) => { const material = lookups.materials.find((item) => `${item.materialCode}|${item.quantityUnit}` === value); setValues((current) => ({ ...current, materialCode: material?.materialCode, quantityUnit: material?.quantityUnit })); }} options={lookups.materials.map((material) => ({ value: `${material.materialCode}|${material.quantityUnit}`, label: `${material.materialName} (${material.materialCode}) · ${material.quantityUnit}` }))} />{field('productionOrder', 'Production order / batch number')}{quantity('Required quantity')}{remarks()}<p>Submitting a request does not reserve or deduct stock.</p></>}
      {action === 'dispense' && <>{field('receiptId', 'Approved batch (earliest expiry first)', 'select', { options: options.map((item) => ({ value: item._id, label: `${item.batchNo} · ${item.availableQuantity} ${item.quantityUnit} · ${item.verification?.location} · expiry ${item.expiryDate?.slice(0, 10)}` })) })}{quantity('Actual dispensing quantity')}<p>Remaining request: {Math.round((record.quantity - record.issues.reduce((sum, issue) => sum + issue.quantity, 0)) * 1e6) / 1e6} {record.quantityUnit}. Only confirmed dispensing reduces stock.</p></>}
      {action === 'receive' && <>{field('issueId', 'Dispensing number', 'select', { options: issues.map((issue) => ({ value: issue._id, label: `${issue.number} · ${issue.batchNo} · ${issue.quantity} ${record.quantityUnit}` })) })}{field('decision', 'Receipt decision', 'select', { options: ['Accept', 'Discrepancy'] })}{field('actualQuantity', 'Actual quantity received', 'number', { min: 0, step: '0.000001' })}{field('reason', 'Discrepancy reason', 'textarea', { required: values.decision === 'Discrepancy' })}{remarks()}<p>Check material code, name, batch, quantity, containers, requisition and dispensing number. Confirmation does not change warehouse stock.</p></>}
      {action === 'resolve' && <>{field('issueId', 'Dispensing discrepancy', 'select', { options: issues.map((issue) => ({ value: issue._id, label: `${issue.number} · difference ${issue.differenceQuantity}` })) })}{field('reason', 'Resolution / corrective action', 'textarea')}<p>This closes the discrepancy and preserves its original details. Any physical stock correction requires a separate administrator adjustment.</p></>}
      {action === 'fg' && <>{field('materialCode', 'FG code')}{field('materialName', 'FG name')}{field('batchNo', 'FG batch number')}{quantity('Manufactured quantity')}{field('quantityUnit', 'Quantity unit')}{field('manufacturingDate', 'Manufacturing date', 'date', { max: today() })}{field('expiryDate', 'Expiry date', 'date')}{field('sourceRequisitions', 'Completed source requisitions (select all used)', 'multiselect', { options: options.map((item) => ({ value: item._id, label: `${item.number} · ${item.productionOrder} · ${item.materialName}` })) })}{remarks()}<p>After creating the handover, attach the required documents and submit it for warehouse verification.</p></>}
      {action === 'acceptFg' && <>{field('decision', 'Verification decision', 'select', { options: ['Accept', 'Discrepancy'] })}{values.decision === 'Accept' ? <>{quantity('Accepted quantity')}{field('location', 'Storage location', 'select', { options: locations })}{remarks(Number(values.quantity) !== record.quantity || record.status === 'Discrepancy')}</> : field('reason', 'Discrepancy reason', 'textarea')}<p>Check packing, documents, dates and physical condition. Explain any quantity difference before acceptance.</p></>}
      {action === 'dispatch' && <>{field('fgReceipt', 'Available FG batch', 'select', { options: options.filter((item) => item.availableQuantity > 0 && new Date(item.expiryDate) > new Date()).map((item) => ({ value: item._id, label: `${item.materialName} / ${item.batchNo} · ${item.availableQuantity} ${item.quantityUnit} · ${item.location}` })) })}{field('customer', 'Customer')}{field('salesOrder', 'Sales order / invoice')}{quantity('Required dispatch quantity')}{field('dispatchDate', 'Dispatch date', 'date')}{field('destination', 'Destination')}{remarks()}<p>The request does not deduct stock. Warehouse must confirm dispatch.</p></>}
      {action.startsWith('upload') && <>{field('documentKind', 'Document category', 'select', { options: action === 'uploadQc' ? ['Test Report (COA)', 'QC Result', 'Supporting Documents'] : ['FG Documents'] })}<label className="flow-field">Files<input type="file" multiple required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setFiles([...event.target.files])} /><small>Up to five files, 10 MB each. Existing attachments remain in the audit record.</small></label></>}
      {action === 'adjust' && <>{field('quantity', 'Adjustment (+ add / − subtract)', 'number', { step: '0.000001' })}{field('reason', 'Reason and source reference', 'textarea')}<p>Current available quantity: {record.availableQuantity} {record.quantityUnit}. A permanent audit entry records the adjustment.</p></>}
    </div>
    {action === 'tests' && <><p>QC analyst: {user.name} · ID {user.id || user._id}. All changes are retained in the audit trail.</p>{tests.map((test, index) => <section className="flow-test" key={index}><div className="card-heading"><h4>Test {index + 1}</h4><button className="outline" type="button" disabled={tests.length === 1} onClick={() => setTests((current) => current.filter((_, row) => row !== index))}>Remove row</button></div><div className="flow-form-grid">{['testName', 'specification', 'requiredLimit', 'actualResult', 'testMethod', 'result', 'testDate', 'remarks'].map((key) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')} type={key === 'result' ? 'select' : key === 'testDate' ? 'date' : key === 'remarks' ? 'textarea' : 'text'} value={test[key]} options={['Pass', 'Fail']} required={key !== 'remarks'} onChange={(value) => setTests((current) => current.map((item, row) => row === index ? { ...item, [key]: value } : item))} />)}</div><small>{test.remarks.trim().split(/\s+/).filter(Boolean).length}/250 words in remarks</small></section>)}<button className="outline" type="button" onClick={() => setTests((current) => [...current, emptyTest()])}>+ Add test</button></>}
    {['acceptRaw', 'dispense', 'receive', 'acceptFg', 'confirmDispatch'].includes(action) && <label className="flow-confirm"><input type="checkbox" required checked={Boolean(values.verified)} onChange={(event) => update('verified', event.target.checked)} />I have physically verified the material, batch, quantity, packing and required documents.</label>}
    {action === 'submitFg' && <p>Submit this handover and its documents to Warehouse for physical verification. It will remain outside available stock until accepted.</p>}
    {action === 'confirmDispatch' && <p>Confirm dispatch of {record.quantity} {record.quantityUnit} to {record.customer}. This deducts finished goods stock immediately.</p>}
    <div className="flow-buttons"><button className="outline" type="button" onClick={onCancel}>Cancel</button><button className="primary" type="submit">{busy ? 'Saving...' : action === 'sampling' ? 'Record collection & start testing' : action === 'confirmDispatch' ? 'Confirm dispatch' : 'Save & confirm'}</button></div>
    </fieldset>{error && <p className="form-message error" role="alert">{error}</p>}
  </form>;
}
