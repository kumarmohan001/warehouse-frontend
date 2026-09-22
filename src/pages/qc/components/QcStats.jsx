import React from 'react';
import DashboardStats from '../../shared/dashboard/DashboardStats';

export const qcStats = [['Pending Sampling', '03', 'new arrivals', 'blue'], ['Under Test', '02', 'batches in progress', 'amber'], ['Approved Today', '05', 'up 2 vs yesterday', 'green'], ['Rejected Today', '01', 'see QC-1187', 'rose']];
export default function QcStats({ stats }) { return <DashboardStats stats={stats || qcStats} />; }
