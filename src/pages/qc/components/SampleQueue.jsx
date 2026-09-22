import React from 'react';
import DashboardTable from '../../shared/dashboard/DashboardTable';

export const sampleQueue = { title: 'Sample queue', actionLabel: '+ Log sample', columns: ['Sample No.', 'Material', 'Batch', 'Sampled By', 'Status'], rows: [['SMP-00456', 'RM-001', 'B-2291', 'A. Sharma', 'Under Test'], ['SMP-00455', 'RM-009', 'B-2281', 'N. Rao', 'Approved'], ['SMP-00454', 'RM-002', 'B-2287', 'A. Sharma', 'Hold'], ['SMP-00453', 'RM-014', 'B-2276', 'N. Rao', 'Rejected']] };
export default function SampleQueue({ data, onCreate }) { return <DashboardTable {...(data || sampleQueue)} onAction={onCreate} />; }
