import { workflowPages } from './shared/workflow/pages';
import EditProfile from './shared/EditProfile';
import admin from './admin';
import warehouse from './warehouse';
import qc from './qc';
import production from './production';

const pagesByRole = {
  admin: { ...admin, ...workflowPages.admin, Dashboard: admin.Dashboard },
  warehouse: { ...warehouse, ...workflowPages.warehouse, Dashboard: warehouse.Dashboard },
  'qc-test': { ...qc, ...workflowPages['qc-test'], Dashboard: qc.Dashboard },
  production: { ...production, ...workflowPages.production, Dashboard: production.Dashboard },
};
export const getRolePage = (role, page) => page === 'Edit Profile' ? EditProfile : pagesByRole[role]?.[page];
