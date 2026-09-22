import { request } from '../../api/httpClient';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const usersApi = {
  list: (token, filters = {}) => {
    const params = new URLSearchParams({ page: String(filters.page || 1), limit: '7' });
    if (filters.search) params.set('search', filters.search);
    if (filters.role) params.set('role', filters.role);
    if (filters.status) params.set('status', filters.status);
    return request(`/api/user?${params}`, { headers: authHeaders(token) });
  },
  create: (token, data) => request('/api/user', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  update: (token, id, data) => request(`/api/user/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) }),
  remove: (token, id) => request(`/api/user/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
};
