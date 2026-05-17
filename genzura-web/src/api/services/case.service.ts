import apiClient from '../client';

export const caseService = {
  getAll: async () => {
    const response = await apiClient.get('/cases');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/cases', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/cases/${id}/status`, { status });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/cases/analytics');
    return response.data;
  },

  addNote: async (id: string, text: string) => {
    const response = await apiClient.post(`/cases/${id}/notes`, { text });
    return response.data;
  },

  addTeamMember: async (caseId: string, userId: string) => {
    const response = await apiClient.post(`/cases/${caseId}/team`, { userId });
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/cases/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/cases/${id}`);
    return response.data;
  },
};
