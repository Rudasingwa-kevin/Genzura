import apiClient from '../client';

export interface AttorneyDocument {
  id: string;
  attorneyId: string;
  type: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  isPublic: boolean;
  issuedDate?: string;
  issuer?: string;
  uploadedAt: string;
  updatedAt: string;
}

export const attorneyDocumentService = {
  /**
   * Upload a new document
   */
  upload: async (formData: FormData) => {
    const response = await apiClient.post('/users/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all documents for the authenticated user
   */
  getMyDocuments: async (): Promise<{ success: boolean; data: AttorneyDocument[] }> => {
    const response = await apiClient.get('/users/documents');
    return response.data;
  },

  /**
   * Update document (e.g., toggle visibility)
   */
  updateDocument: async (
    id: string,
    data: { isPublic?: boolean; title?: string; description?: string; issuer?: string; issuedDate?: string }
  ) => {
    const response = await apiClient.patch(`/users/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete document
   */
  deleteDocument: async (id: string) => {
    const response = await apiClient.delete(`/users/documents/${id}`);
    return response.data;
  },

  /**
   * Get download URL for document
   */
  getDownloadUrl: async (id: string): Promise<{ success: boolean; data: { url: string; fileName: string; mimeType: string } }> => {
    const response = await apiClient.get(`/users/documents/${id}/download`);
    return response.data;
  },
};
