const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

export async function request(path, options = {}) {
  try {
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      // Keep JSON content type when a feature adds Authorization or another header.
      headers: { 'Content-Type': 'application/json', ...options.headers },
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
