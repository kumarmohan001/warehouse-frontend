import React from 'react';
import DashboardStats from '../../shared/dashboard/DashboardStats';

export const warehouseStats = [
  ['In Quarantine', '1,250 kg', '3 batches', 'blue'],
  ['Under Test', '640 kg', '2 batches', 'amber'],
  ['Available Stock', '9,830 kg', 'up 750 kg today', 'green'],
  ['Pending Requisitions', '04', 'awaiting dispensing', 'rose'],
];

export default function WarehouseStats({ stats }) {
  return <DashboardStats stats={stats || warehouseStats} />;
}
