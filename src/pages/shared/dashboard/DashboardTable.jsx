import React from 'react';
import AuditTable from '../../../components/AuditTable';

export default function DashboardTable({ title, actionLabel, columns, rows, onAction }) {
  return <AuditTable title={title} actionLabel={actionLabel} columns={columns} rows={rows} onAction={onAction} />;
}
