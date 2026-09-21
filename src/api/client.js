const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

async function request(path, options = {}) {
  try {
    const response = await fetch(API_BASE_URL + path, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error(body.message || 'Something went wrong.');
    return body.data;
  } catch (error) {
    if (error instanceof TypeError || /failed to fetch|networkerror/i.test(error.message)) {
      const unavailable = new Error('SERVICE_UNAVAILABLE');
      unavailable.code = 'SERVICE_UNAVAILABLE';
      throw unavailable;
    }
    throw error;
  }
}

export const authApi = {
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: (token) => request('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }),
};

export const dashboardApi = {
  overview: (token) => request('/api/dashboard/overview', { headers: { Authorization: 'Bearer ' + token } }),
};
