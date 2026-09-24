import { request } from '../../api/httpClient';
const headers = (token) => ({ Authorization: `Bearer ${token}` });
export const workflowApi = {
  get: (token, path, params = {}) => request(`/api/workflow/${path}?${new URLSearchParams(params)}`, { headers: headers(token) }),
  post: (token, path, values = {}) => request(`/api/workflow/${path}`, { method: 'POST', headers: headers(token), body: values instanceof FormData ? values : JSON.stringify(values) }),
};
