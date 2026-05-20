import apiClient from '../client';

export const userService = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getActiveUsers: async () => {
    const response = await apiClient.get('/users/active');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/users/analytics');
    return response.data;
  },

  inviteUser: async (data: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    location?: string;
    jobTitle?: string;
  }) => {
    const response = await apiClient.post('/users/invite', data);
    return response.data;
  },
};
