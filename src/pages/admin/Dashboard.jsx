import React from 'react';
import RoleDashboardLayout from '../shared/dashboard/RoleDashboardLayout';
import AdminStats from './components/AdminStats';
import TraceabilityOverview from './components/TraceabilityOverview';
import AuditTrail from './components/AuditTrail';

// Pass `data` from an API call: { stats, lifecycle, auditTrail }.
export default function Dashboard({ data = {}, overview }) {
  return <RoleDashboardLayout title="Admin dashboard" subtitle="System-wide overview across all roles">
    <AdminStats stats={data.stats} overview={overview} />
    <TraceabilityOverview lifecycle={data.lifecycle} />
    <AuditTrail data={data.auditTrail} onExport={() => window.print()} />
  </RoleDashboardLayout>;
}
