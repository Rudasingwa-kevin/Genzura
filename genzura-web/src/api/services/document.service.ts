import apiClient from '../client';

export const documentService = {
  getAll: async () => {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  getByCase: async (caseId: string) => {
    const response = await apiClient.get(`/documents/case/${caseId}`);
    return response.data;
  },

  upload: async (caseId: string, file: File) => {
    const formData = new FormData();
    formData.append('caseId', caseId);
    formData.append('file', file);

    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  remove: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },
};
