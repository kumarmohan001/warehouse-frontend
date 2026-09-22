import React from 'react';
import RoleDashboardLayout from '../shared/dashboard/RoleDashboardLayout';
import ProductionStats from './components/ProductionStats';
import RequisitionLifecycle from './components/RequisitionLifecycle';
import MyRequisitions from './components/MyRequisitions';

// Pass `data` from an API call: { stats, lifecycle, requisitions }.
export default function Dashboard({ data = {}, onNavigate = () => {} }) {
  return <RoleDashboardLayout title="Production dashboard" subtitle="Material requisitions and receipt confirmation">
    <ProductionStats stats={data.stats} />
    <RequisitionLifecycle lifecycle={data.lifecycle} />
    <MyRequisitions data={data.requisitions} onCreate={() => onNavigate('Create Requisition')} />
  </RoleDashboardLayout>;
}
