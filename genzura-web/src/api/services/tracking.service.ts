import apiClient from '../client';

export const trackingService = {
  trackDocumentDownload: async (documentId: string) => {
    try {
      await apiClient.post(`/tracking/document/${documentId}/download`);
    } catch (error) {
      console.error('Failed to track document download:', error);
      // Don't throw error - tracking should not block downloads
    }
  },

  trackPDFExport: async (caseId: string) => {
    try {
      await apiClient.post(`/tracking/case/${caseId}/pdf-export`);
    } catch (error) {
      console.error('Failed to track PDF export:', error);
      // Don't throw error - tracking should not block exports
    }
  },
};
