import React from 'react';
import DashboardStats from '../../shared/dashboard/DashboardStats';

export const adminStats = [
  ['Total Users', '—', 'Including your account', 'blue'],
  ['Open Requisitions', '07', '2 awaiting dispensing', 'amber'],
  ['Pending QC', '05', 'batches under test', 'rose'],
  ['Dispatches Today', '12', 'up 3 vs yesterday', 'green'],
];
export default function AdminStats({ stats, overview }) { return <DashboardStats stats={stats || adminStats} overview={overview} useOverview />; }
