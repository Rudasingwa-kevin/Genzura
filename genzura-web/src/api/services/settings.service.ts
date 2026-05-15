import apiClient from '../client';

export const settingsService = {
  getAll: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  update: async (settingsMap: Record<string, string>) => {
    const response = await apiClient.put('/settings', settingsMap);
    return response.data;
  },
};
