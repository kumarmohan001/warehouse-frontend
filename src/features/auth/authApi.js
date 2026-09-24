import { request } from '../../api/httpClient';

export const authApi = {
  profile: (token) => request('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
  updateProfile: (token, data) => request('/api/auth/profile', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: data }),
  changePassword: (token, data) => request('/api/auth/password', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: (token) => request('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};
