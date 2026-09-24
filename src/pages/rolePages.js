import { workflowPages } from './shared/workflow/pages';
import EditProfile from './shared/EditProfile';
import admin from './admin';
import warehouse from './warehouse';
import qc from './qc';
import production from './production';

const pagesByRole = {
  admin: { ...admin, 'Warehouse / Location': workflowPages.admin['Warehouse / Location'], 'QC Records': workflowPages.admin['QC Records'], 'Receiving Stock': workflowPages.admin['Receiving Stock'] },
  warehouse: { ...warehouse, 'QC Approved Queue': workflowPages.warehouse['QC Approved Queue'], 'Warehouse / Location': workflowPages.warehouse['Warehouse / Location'] },
  'qc-test': { ...qc, ...workflowPages['qc-test'], Dashboard: qc.Dashboard },
  production,
};
export const getRolePage = (role, page) => page === 'Edit Profile' ? EditProfile : pagesByRole[role]?.[page];
