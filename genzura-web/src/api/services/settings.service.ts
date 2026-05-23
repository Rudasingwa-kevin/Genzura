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

  // Public - users need to see subscription status
  getSubscriptionInfo: async () => {
    const response = await apiClient.get('/settings/subscription-info');
    return response.data;
  },

  // Admin only
  activateSubscriptionSystem: async () => {
    const response = await apiClient.post('/settings/subscription/activate');
    return response.data;
  },

  pauseSubscriptionSystem: async () => {
    const response = await apiClient.post('/settings/subscription/pause');
    return response.data;
  }
};
