import React from 'react';
import ProcessTimeline from '../../shared/dashboard/ProcessTimeline';

export const warehouseBatchLifecycle = {
  title: 'RAW MATERIAL BATCH — RM-001 / B-2291',
  steps: ['Receiving', 'Doc. Check', 'Quarantine', 'QC Test', 'QC Approved', 'WH Verified', 'Available'],
  activeStep: 4,
};

export default function BatchLifecycle({ lifecycle }) {
  return <ProcessTimeline {...(lifecycle || warehouseBatchLifecycle)} />;
}
