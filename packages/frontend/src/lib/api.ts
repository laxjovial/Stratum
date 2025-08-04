import { auth } from './firebase';

const getApiUrl = () => {
  // This should be configured via environment variables for different environments (dev, prod)
  // e.g., process.env.NEXT_PUBLIC_API_URL
  // For local development, Next.js can be configured to proxy requests to the backend.
  // We'll return a relative path assuming a proxy is set up.
  return '/api/v1';
};

const api = {
  /**
   * A wrapper around the native fetch API.
   * - Automatically adds the Firebase auth token to the headers.
   * - Sets the Content-Type to application/json.
   * - Throws a detailed error on non-ok responses.
   * - Handles responses with no content.
   * @param endpoint The API endpoint to call (e.g., '/users').
   * @param options Optional fetch options.
   */
  async request(endpoint: string, options: RequestInit = {}) {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error details from the response body
      const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred.' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) { // No Content
      return null;
    }

    return response.json();
  },

  get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
