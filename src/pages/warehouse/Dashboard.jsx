import React from 'react';
import RoleDashboardLayout from '../shared/dashboard/RoleDashboardLayout';
import WarehouseStats from './components/WarehouseStats';
import BatchLifecycle from './components/BatchLifecycle';
import MaterialReceivingLog from './components/MaterialReceivingLog';

// Pass `data` from an API call: { stats, lifecycle, receivingLog }.
export default function Dashboard({ data = {}, onNavigate = () => {} }) {
  return <RoleDashboardLayout title="Warehouse dashboard" subtitle="Material movement and inventory control">
    <WarehouseStats stats={data.stats} />
    <BatchLifecycle lifecycle={data.lifecycle} />
    <MaterialReceivingLog data={data.receivingLog} onCreate={() => onNavigate('Material Receiving')} />
  </RoleDashboardLayout>;
}
