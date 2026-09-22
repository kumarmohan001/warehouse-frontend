import React from 'react';
import DashboardTable from '../../shared/dashboard/DashboardTable';

export const materialReceivingLog = {
  title: 'Material receiving log', actionLabel: '+ New GRN',
  columns: ['GRN No.', 'Supplier', 'Material', 'Batch', 'Qty', 'Status'],
  rows: [['GRN-01123', 'Vertex Chemicals', 'RM-001', 'B-2291', '1,000 Kg', 'Quarantine'], ['GRN-01122', 'Nord Polymers', 'RM-014', 'B-2288', '500 Kg', 'Approved'], ['GRN-01121', 'Vertex Chemicals', 'RM-002', 'B-2287', '250 Kg', 'Hold'], ['GRN-01120', 'Solvex Labs', 'RM-009', 'B-2281', '1,200 Kg', 'Approved']],
};

export default function MaterialReceivingLog({ data, onCreate }) {
  return <DashboardTable {...(data || materialReceivingLog)} onAction={onCreate} />;
}
