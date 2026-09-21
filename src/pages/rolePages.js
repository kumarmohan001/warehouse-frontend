import admin from './admin';
import warehouse from './warehouse';
import qc from './qc';
import production from './production';

const pagesByRole = { admin, warehouse, 'qc-test': qc, production };
export const getRolePage = (role, page) => pagesByRole[role]?.[page];
