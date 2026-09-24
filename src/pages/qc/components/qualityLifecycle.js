export function qualityLifecycle(receipt) {
  const steps = ['Quarantine', 'Sampling', 'Under Test', 'Result Entry', 'Disposition'];
  const history = receipt.statusHistory || [];
  const visited = new Set(history.flatMap((entry) => [entry.from, entry.to]));
  visited.add(receipt.status);
  const final = ['Approved', 'Rejected', 'Available'].includes(receipt.status);
  const sampled = Boolean(receipt.sampling?.number);
  const results = Boolean(receipt.qc?.tests?.length);
  const tested = visited.has('Under Test');
  const blocked = ['Hold', 'Document Hold'].includes(receipt.status);
  const activeStep = receipt.status === 'Document Hold' ? 0 : final ? 4 : results ? 3 : tested ? 2 : sampled ? 1 : 0;
  const stepStates = [
    visited.has('Quarantine') ? 'done' : 'pending',
    sampled ? 'done' : 'pending',
    tested ? 'done' : 'pending',
    results ? 'done' : 'pending',
    final ? 'done' : 'pending',
  ];
  if (!final) stepStates[activeStep] = blocked ? 'blocked' : 'current';
  const lastChange = history.at(-1);
  const note = receipt.status === 'Document Hold' ? 'Documents pending. Complete the document check to release this batch to Quarantine.'
    : receipt.status === 'Hold' ? lastChange?.note || 'QC has placed this batch on hold.'
    : receipt.status === 'Rejected' ? lastChange?.note || 'QC rejected this batch.'
    : receipt.status === 'Approved' ? 'QC approved this batch.'
    : receipt.status === 'Under Test' ? 'QC testing is in progress.'
    : 'Waiting for the next QC action.';
  return { title: `BATCH ${receipt.batchNo} — QUALITY LIFECYCLE`, steps, activeStep, stepStates, note };
}
