import axios from 'axios';

/**
 * Resolves the API Base URL with strict localhost/dev isolation:
 * - When running on localhost / 127.0.0.1 or in Vite development mode,
 *   it will ALWAYS connect to the DEV server (https://server.plexivia.online)
 *   or an explicit local backend port (e.g. http://localhost:5093).
 *   It strictly prevents connecting to the LIVE server (*monsuralitravels.com) from localhost,
 *   regardless of whether the active git branch is 'dev' or 'live'.
 * - In production cloud deployments, it connects to the configured environment URL
 *   (e.g., https://api.monsuralitravels.com on live, https://server.plexivia.online on dev).
 */
export const getApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.'));

  if (isLocalhost || import.meta.env?.DEV) {
    const configured = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL;
    if (configured && !configured.includes('monsuralitravels.com')) {
      return configured;
    }
    return 'https://server.plexivia.online';
  }

  return (
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_API_URL ||
    'https://api.monsuralitravels.com'
  );
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: 401 → silent token refresh queue ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRT } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        if (newRT) localStorage.setItem('refreshToken', newRT);

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
