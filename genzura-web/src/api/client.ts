import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('genzura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle common errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on password verification failures
      // These should show error messages to the user instead
      const isPasswordError = error.response?.data?.error?.toLowerCase().includes('password');
      const isDeleteAccount = error.config?.url?.includes('/delete-account');
      const isChangePassword = error.config?.url?.includes('/change-password');

      if (!isPasswordError && !isDeleteAccount && !isChangePassword) {
        localStorage.removeItem('genzura_token');
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (!isAuthPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
