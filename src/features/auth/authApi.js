import { request } from '../../api/httpClient';

export const authApi = {
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: (token) => request('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};
