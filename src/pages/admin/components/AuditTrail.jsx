import React from 'react';
import DashboardTable from '../../shared/dashboard/DashboardTable';

export const auditTrail = { title: 'Audit trail', actionLabel: 'Export log', columns: ['Timestamp', 'User', 'Role', 'Action', 'Reference'], rows: [['Today, 09:12', 'R. Iyer', 'Warehouse', 'Accepted material', 'GRN-01123'], ['Today, 09:04', 'A. Sharma', 'QC Test', 'Approved batch', 'SMP-00456'], ['Today, 08:51', 'M. Fernandes', 'Production', 'Raised discrepancy', 'MR-000125'], ['Yesterday, 18:20', 'Admin', 'Admin', 'Added user', 'U-0092']] };
export default function AuditTrail({ data, onExport }) { return <DashboardTable {...(data || auditTrail)} onAction={onExport} />; }
