import AuditEvents from './AuditEvents';
import React from 'react';
import WorkflowPage from './WorkflowPage';
import WorkflowOverview from './WorkflowOverview';
import Locations from './Locations';

const page = (title, kind, mode, defaultStatus = '') => (props) => <WorkflowPage {...props} title={title} kind={kind} mode={mode} defaultStatus={defaultStatus} />;
export const workflowPages = {
  'qc-test': {
    Dashboard: (props) => <WorkflowOverview {...props} mode="qc" />,
    'Receiving Stock': page('Receiving Stock', 'raw', 'qc'),
    'Quarantine Queue': page('Quarantine Queue', 'raw', 'qc', 'Quarantine'),
    Sampling: page('Sampling Details', 'raw', 'qc', 'Quarantine,Hold'),
    'Under Test': page('Under Test', 'raw', 'qc', 'Under Test'),
    'Enter Test Results': page('QC Test Results', 'raw', 'qc', 'Under Test,Hold'),
    'QC Documents': page('QC Documents', 'raw', 'qc'),
    'Approve / Reject / Hold': page('QC Final Decision', 'raw', 'qc', 'Under Test,Hold'),
  },
  warehouse: {
    Dashboard: (props) => <WorkflowOverview {...props} mode="warehouse" />,
    'Warehouse Stock': page('Raw Material Inventory', 'raw', 'warehouse'),
    'QC Approved Queue': page('Warehouse Verification', 'raw', 'warehouse', 'Approved'),
    'Document Check': page('Supplier Document Check', 'raw', 'warehouse', 'Document Hold'),
    Quarantine: page('Quarantine Stock', 'raw', 'warehouse', 'Quarantine,Document Hold'),
    'Requisitions (Pending)': page('Production Requisitions', 'requisition', 'warehouse', 'Pending,Partially Dispensed,Discrepancy'),
    Dispensing: page('Warehouse Dispensing', 'requisition', 'warehouse'),
    'FG Receiving': page('Finished Goods Verification', 'fg', 'warehouse', 'Pending Verification,Discrepancy'),
    'FG Stock': page('Finished Goods Stock', 'fg', 'warehouse', 'Available'),
    'FG Dispatch': page('Finished Goods Dispatch', 'dispatch', 'warehouse'),
    'Warehouse / Location': Locations,
  },
  production: {
    Dashboard: (props) => <WorkflowOverview {...props} mode="production" />,
    'Create Requisition': page('Material Requisitions', 'requisition', 'production'),
    'Requisition Status': page('Requisition Status', 'requisition', 'production'),
    'Dispensing Notifications': page('Material Sent to Production', 'requisition', 'production', 'Sent to Production,Partially Dispensed'),
    'Receive Material': page('Production Material Receipt', 'requisition', 'production', 'Sent to Production,Partially Dispensed'),
    Discrepancies: page('Receipt Discrepancies', 'requisition', 'production', 'Discrepancy'),
    'FG Handover': page('Finished Goods Handover', 'fg', 'production'),
  },
  admin: {
    Dashboard: (props) => <WorkflowOverview {...props} mode="admin" />,
    'All Transactions': AuditEvents,
    Reports: (props) => <WorkflowOverview {...props} mode="admin" />,
    'Warehouse / Location': Locations,
    'Stock Overview': page('Raw Material Stock Overview', 'raw', 'warehouse'),
    'QC Records': page('Quality Control Records', 'raw', 'qc'),
    'Receiving Stock': page('Receiving Stock', 'raw', 'qc'),
    'Production Requests': page('Production Requests', 'requisition', 'warehouse'),
    Dispatch: page('FG Dispatch', 'dispatch', 'warehouse'),
  },
};
