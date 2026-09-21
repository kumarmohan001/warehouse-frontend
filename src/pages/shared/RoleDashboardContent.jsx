import React from 'react';
import StatsGrid from '../../components/StatsGrid';
import Traceability from '../../components/Traceability';
import AuditTable from '../../components/AuditTable';

export default function RoleDashboardContent({ config, overview, showLiveStats, onNavigate }) {
  return <>
    <div className="page-title"><div><h1>{config.label} dashboard</h1><p>{config.subtitle}</p></div></div>
    <StatsGrid stats={config.stats} overview={overview} isAdmin={showLiveStats} />
    <Traceability title={config.processTitle} steps={config.processSteps} activeStep={config.processActive} />
    <AuditTable title={config.tableTitle} actionLabel={config.actionLabel} columns={config.columns} rows={config.rows} onAction={() => onNavigate(config.actionLabel)} />
  </>;
}
