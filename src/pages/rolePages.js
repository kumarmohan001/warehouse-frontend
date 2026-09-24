import { workflowPages } from './shared/workflow/pages';
import EditProfile from './shared/EditProfile';
import admin from './admin';
import warehouse from './warehouse';
import qc from './qc';
import production from './production';

const pagesByRole = { admin, warehouse, 'qc-test': qc, production };
export const getRolePage = (role, page) => page === 'Edit Profile' ? EditProfile : workflowPages[role]?.[page] || pagesByRole[role]?.[page];
