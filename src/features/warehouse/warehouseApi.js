import { request } from '../../api/httpClient';

const authorization = (token) => ({ Authorization: `Bearer ${token}` });

export const warehouseApi = {
  create: (token, formData) => request('/api/warehouse/create', { method: 'POST', headers: authorization(token), body: formData }),
  qcAssignees: (token) => request('/api/warehouse/qc-assignees', { headers: authorization(token) }),
  notifications: (token) => request('/api/warehouse/notifications', { headers: authorization(token) }),
  list: (token, params = {}) => request(`/api/warehouse/receivings?${new URLSearchParams(params)}`, { headers: authorization(token) }),
  detail: (token, id) => request(`/api/warehouse/receivings/${id}`, { headers: authorization(token) }),
  markRead: (token, id) => request(`/api/warehouse/notifications/${id}/read`, { method: 'PATCH', headers: authorization(token) }),
  updateStatus: (token, id, values) => request(`/api/warehouse/receivings/${id}/status`, { method: 'PATCH', headers: authorization(token), body: JSON.stringify(values) }),
  update: (token, id, values) => request(`/api/warehouse/receivings/${id}`, { method: 'PATCH', headers: authorization(token), body: JSON.stringify(values) }),
  updateDocuments: (token, id, formData) => request(`/api/warehouse/receivings/${id}/documents`, { method: 'PATCH', headers: authorization(token), body: formData }),
  remove: (token, id) => request(`/api/warehouse/receivings/${id}`, { method: 'DELETE', headers: authorization(token) }),
};
