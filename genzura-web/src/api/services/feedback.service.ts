import apiClient from '../client';

export const feedbackService = {
  submitFeedback: async (data: { subject: string; category: string; message: string }) => {
    const response = await apiClient.post('/feedback', data);
    return response.data;
  },

  getMyFeedback: async () => {
    const response = await apiClient.get('/feedback/my');
    return response.data;
  },
  
  // Admin only
  getAllFeedback: async () => {
    const response = await apiClient.get('/feedback');
    return response.data;
  },
  
  // Admin only
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/feedback/${id}/status`, { status });
    return response.data;
  }
};
