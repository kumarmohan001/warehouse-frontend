import React from 'react';
import DashboardStats from '../../shared/dashboard/DashboardStats';

export const productionStats = [['Open Requisitions', '04', 'awaiting dispensing', 'blue'], ['Awaiting Receipt', '01', 'dispensed, not yet received', 'amber'], ['Received Today', '03', 'up 1 vs yesterday', 'green'], ['Open Discrepancies', '01', 'see MR-000125', 'rose']];
export default function ProductionStats({ stats }) { return <DashboardStats stats={stats || productionStats} />; }
