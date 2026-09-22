import React from 'react';
import DashboardTable from '../../shared/dashboard/DashboardTable';

export const myRequisitions = { title: 'My requisitions', actionLabel: '+ New requisition', columns: ['MR No.', 'Material', 'Qty Req.', 'Batch Issued', 'Status'], rows: [['MR-000125', 'RM-001', '250 kg', 'B-2291', 'Sent To Prod'], ['MR-000124', 'RM-009', '400 kg', 'B-2281', 'Accepted'], ['MR-000123', 'RM-002', '120 kg', '—', 'Pending'], ['MR-000122', 'RM-014', '600 kg', 'B-2288', 'Discrepancy']] };
export default function MyRequisitions({ data, onCreate }) { return <DashboardTable {...(data || myRequisitions)} onAction={onCreate} />; }
