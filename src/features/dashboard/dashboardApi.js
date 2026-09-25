import { request } from '../../api/httpClient';

export const dashboardApi = {
  mine: (token) => request('/api/dashboard/me', { headers: { Authorization: `Bearer ${token}` } }),
  account: (token, id) => request(`/api/dashboard/admin/accounts/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } }),
  adminOverview: (token) => request('/api/dashboard/admin/overview', { headers: { Authorization: `Bearer ${token}` } }),
};
