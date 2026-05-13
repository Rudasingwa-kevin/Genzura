import apiClient from '../client';

export const userService = {
  getAll: async () => {
    const response = await apiClient.get('/users');
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
};
