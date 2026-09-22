import React from 'react';
import ProcessTimeline from '../../shared/dashboard/ProcessTimeline';

export const traceabilityOverview = { title: 'END-TO-END TRACEABILITY', steps: ['Supplier', 'Receiving', 'QC', 'Warehouse', 'Production', 'FG', 'Dispatch'], activeStep: 6 };
export default function TraceabilityOverview({ lifecycle }) { return <ProcessTimeline {...(lifecycle || traceabilityOverview)} />; }
