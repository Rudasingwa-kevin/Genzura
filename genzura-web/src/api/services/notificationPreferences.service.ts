import apiClient from '../client';

export interface NotificationPreferences {
  id: string;
  userId: string;
  caseAssignments: boolean;
  timelineMilestones: boolean;
  documentActivity: boolean;
  securityAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationPreferencesService = {
  get: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/notification-preferences');
    return response.data;
  },

  update: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await apiClient.put('/notification-preferences', preferences);
    return response.data;
  },
};
