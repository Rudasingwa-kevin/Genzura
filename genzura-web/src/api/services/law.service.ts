import apiClient from '../client';

export const lawService = {
  matchLawsToCase: async (caseId: string) => {
    const response = await apiClient.post(`/cases/${caseId}/match-laws`);
    return response.data;
  },

  getCaseLaws: async (caseId: string) => {
    const response = await apiClient.get(`/cases/${caseId}/laws`);
    return response.data;
  },

  addLawToCase: async (caseId: string, data: {
    legalCodeId?: string;
    legalArticleId?: string;
    relevance?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/cases/${caseId}/laws`, data);
    return response.data;
  },

  updateCaseLaw: async (caseId: string, lawId: string, data: {
    relevance?: string;
    notes?: string;
  }) => {
    const response = await apiClient.put(`/cases/${caseId}/laws/${lawId}`, data);
    return response.data;
  },

  removeLawFromCase: async (caseId: string, lawId: string) => {
    const response = await apiClient.delete(`/cases/${caseId}/laws/${lawId}`);
    return response.data;
  },

  searchLaws: async (params: {
    q?: string;
    type?: string;
    caseType?: string;
  }) => {
    const response = await apiClient.get('/laws/search', { params });
    return response.data;
  },

  getArticle: async (articleId: string) => {
    const response = await apiClient.get(`/laws/${articleId}`);
    return response.data;
  },
};
