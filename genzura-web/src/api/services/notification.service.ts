import apiClient from '../client';

export const notificationService = {
  getAll: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },

  dismiss: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  }
};
