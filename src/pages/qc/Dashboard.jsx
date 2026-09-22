import React from 'react';
import RoleDashboardLayout from '../shared/dashboard/RoleDashboardLayout';
import QcStats from './components/QcStats';
import QcLifecycle from './components/QcLifecycle';
import SampleQueue from './components/SampleQueue';

// Pass `data` from an API call: { stats, lifecycle, sampleQueue }.
export default function Dashboard({ data = {}, onNavigate = () => {} }) {
  return <RoleDashboardLayout title="QC Test dashboard" subtitle="Sampling, testing and quality disposition">
    <QcStats stats={data.stats} />
    <QcLifecycle lifecycle={data.lifecycle} />
    <SampleQueue data={data.sampleQueue} onCreate={() => onNavigate('Sampling')} />
  </RoleDashboardLayout>;
}
