import React from 'react';
import ProcessTimeline from '../../shared/dashboard/ProcessTimeline';

export const requisitionLifecycle = { title: 'REQUISITION MR-000125 — RM-001, 250 KG', steps: ['Requested', 'Dispensed', 'Sent to Prod.', 'Received', 'Checked', 'Accepted'], activeStep: 3 };
export default function RequisitionLifecycle({ lifecycle }) { return <ProcessTimeline {...(lifecycle || requisitionLifecycle)} />; }
