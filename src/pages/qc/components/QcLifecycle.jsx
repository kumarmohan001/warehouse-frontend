import React from 'react';
import ProcessTimeline from '../../shared/dashboard/ProcessTimeline';

export const qcLifecycle = { title: 'BATCH B-2291 — QUALITY LIFECYCLE', steps: ['Quarantine', 'Sampling', 'Under Test', 'Result Entry', 'Disposition'], activeStep: 2 };
export default function QcLifecycle({ lifecycle }) { return <ProcessTimeline {...(lifecycle || qcLifecycle)} />; }
