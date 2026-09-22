import { request } from '../../api/httpClient';

export const dashboardApi = {
  adminOverview: (token) => request('/api/dashboard/admin/overview', { headers: { Authorization: `Bearer ${token}` } }),
};
