const shared = {
  admin: {
    label: 'Admin', menuTitle: 'ADMIN MENU', subtitle: 'System-wide overview across all roles',
    menu: [['Dashboard', '▦'], ['Users & Permissions', '♙'], ['Material Master', '◇'], ['Supplier Master', '▱'], ['Warehouse / Location', '▤'], ['Stock Overview', '▣'], ['All Transactions', '≡'], ['QC Records', '⌁'], ['Production Requests', '▻'], ['Dispatch', '↗'], ['Reports', '▤']],
    stats: [['Active Users', '18', '4 roles', 'blue'], ['Open Requisitions', '07', '2 awaiting dispensing', 'amber'], ['Pending QC', '05', 'batches under test', 'rose'], ['Dispatches Today', '12', 'up 3 vs yesterday', 'green']],
    processTitle: 'END-TO-END TRACEABILITY', processSteps: ['Supplier', 'Receiving', 'QC', 'Warehouse', 'Production', 'FG', 'Dispatch'], processActive: 6,
    tableTitle: 'Audit trail', actionLabel: 'Export log', columns: ['Timestamp', 'User', 'Role', 'Action', 'Reference'],
    rows: [['Today, 09:12', 'R. Iyer', 'Warehouse', 'Accepted material', 'GRN-01123'], ['Today, 09:04', 'A. Sharma', 'QC Test', 'Approved batch', 'SMP-00456'], ['Today, 08:51', 'M. Fernandes', 'Production', 'Raised discrepancy', 'MR-000125'], ['Yesterday, 18:20', 'Admin', 'Admin', 'Added user', 'U-0092']],
  },
  warehouse: {
    label: 'Warehouse', menuTitle: 'WAREHOUSE MENU', subtitle: 'Material movement and inventory control',
    menu: [['Dashboard', '▦'], ['Stock Form', 'T'],['Material Receiving', '◇'], ['Document Check', '□'], ['Quarantine', '▤'], ['QC Approved Queue', '✓'], ['Warehouse Stock', '▱'], ['Requisitions (Pending)', '▻'], ['Dispensing', '⌁'], ['FG Receiving', '◇'], ['FG Stock', '▣'], ['FG Dispatch', '↗']],
    stats: [['In Quarantine', '1,250 kg', '3 batches', 'blue'], ['Under Test', '640 kg', '2 batches', 'amber'], ['Available Stock', '9,830 kg', 'up 750 kg today', 'green'], ['Pending Requisitions', '04', 'awaiting dispensing', 'rose']],
    processTitle: 'RAW MATERIAL BATCH — RM-001 / B-2291', processSteps: ['Receiving', 'Doc. Check', 'Quarantine', 'QC Test', 'QC Approved', 'WH Verified', 'Available'], processActive: 4,
    tableTitle: 'Material receiving log', actionLabel: '+ New GRN', columns: ['GRN No.', 'Supplier', 'Material', 'Batch', 'Qty', 'Status'],
    rows: [['GRN-01123', 'Vertex Chemicals', 'RM-001', 'B-2291', '1,000 Kg', 'Quarantine'], ['GRN-01122', 'Nord Polymers', 'RM-014', 'B-2288', '500 Kg', 'Approved'], ['GRN-01121', 'Vertex Chemicals', 'RM-002', 'B-2287', '250 Kg', 'Hold'], ['GRN-01120', 'Solvex Labs', 'RM-009', 'B-2281', '1,200 Kg', 'Approved']],
  },
  'qc-test': {
    label: 'QC Test', menuTitle: 'QC MENU', subtitle: 'Sampling, testing and quality disposition',
    menu: [['Dashboard', '▦'], ['Quarantine Queue', '▤'], ['Sampling', '⌁'], ['Under Test', '◷'], ['Enter Test Results', '□'], ['QC Documents', '▱'], ['Approve / Reject / Hold', '✓']],
    stats: [['Pending Sampling', '03', 'new arrivals', 'blue'], ['Under Test', '02', 'batches in progress', 'amber'], ['Approved Today', '05', 'up 2 vs yesterday', 'green'], ['Rejected Today', '01', 'see QC-1187', 'rose']],
    processTitle: 'BATCH B-2291 — QUALITY LIFECYCLE', processSteps: ['Quarantine', 'Sampling', 'Under Test', 'Result Entry', 'Disposition'], processActive: 2,
    tableTitle: 'Sample queue', actionLabel: '+ Log sample', columns: ['Sample No.', 'Material', 'Batch', 'Sampled By', 'Status'],
    rows: [['SMP-00456', 'RM-001', 'B-2291', 'A. Sharma', 'Under Test'], ['SMP-00455', 'RM-009', 'B-2281', 'N. Rao', 'Approved'], ['SMP-00454', 'RM-002', 'B-2287', 'A. Sharma', 'Hold'], ['SMP-00453', 'RM-014', 'B-2276', 'N. Rao', 'Rejected']],
  },
  production: {
    label: 'Production', menuTitle: 'PRODUCTION MENU', subtitle: 'Material requisitions and receipt confirmation',
    menu: [['Dashboard', '▦'], ['Create Requisition', '□'], ['Requisition Status', '◷'], ['Dispensing Notifications', '▱'], ['Receive Material', '◇'], ['Discrepancies', '⌁']],
    stats: [['Open Requisitions', '04', 'awaiting dispensing', 'blue'], ['Awaiting Receipt', '01', 'dispensed, not yet received', 'amber'], ['Received Today', '03', 'up 1 vs yesterday', 'green'], ['Open Discrepancies', '01', 'see MR-000125', 'rose']],
    processTitle: 'REQUISITION MR-000125 — RM-001, 250 KG', processSteps: ['Requested', 'Dispensed', 'Sent to Prod.', 'Received', 'Checked', 'Accepted'], processActive: 3,
    tableTitle: 'My requisitions', actionLabel: '+ New requisition', columns: ['MR No.', 'Material', 'Qty Req.', 'Batch Issued', 'Status'],
    rows: [['MR-000125', 'RM-001', '250 kg', 'B-2291', 'Sent To Prod'], ['MR-000124', 'RM-009', '400 kg', 'B-2281', 'Accepted'], ['MR-000123', 'RM-002', '120 kg', '—', 'Pending'], ['MR-000122', 'RM-014', '600 kg', 'B-2288', 'Discrepancy']],
  },
};

export const roleDashboards = shared;
export const roleLabel = (role) => shared[role]?.label || 'Warehouse';
