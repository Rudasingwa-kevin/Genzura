import apiClient from '../client';

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('genzura_token', response.data.token);
    }
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('genzura_token', response.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('genzura_token');
  },
};
