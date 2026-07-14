import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Enables secure HttpOnly cookie transmission (Refresh Tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch expired tokens (401) and rotate session
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is token expiration (401) and request has not already retried
    const bypassUrls = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    const isBypass = bypassUrls.some(url => originalRequest.url?.includes(url));

    if (error.response?.status === 401 && !isBypass && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt renewal from backend HttpOnly refresh route
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request with the fresh token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired - clear credentials and propagate error
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
