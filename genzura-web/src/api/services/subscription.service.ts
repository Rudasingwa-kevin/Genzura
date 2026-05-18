import api from '../index';

export interface SubscriptionLimits {
  plan: 'Genzura' | 'Intango' | 'Inkingi';
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  cases: {
    current: number;
    limit: number | null;
    canCreate: boolean;
  };
  documents: {
    current: number;
    limit: number | null;
    canUpload: boolean;
    canDownload: boolean;
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}

export const subscriptionService = {
  /**
   * Get current user's subscription limits and usage
   */
  async getLimits(): Promise<SubscriptionLimits> {
    const response = await api.get('/subscriptions/limits');
    return response.data;
  },

  /**
   * Check if user can create a new case
   */
  async checkCaseLimit(): Promise<LimitCheckResult> {
    const response = await api.post('/subscriptions/check/case');
    return response.data;
  },

  /**
   * Check if user can upload a document
   */
  async checkDocumentLimit(): Promise<LimitCheckResult> {
    const response = await api.post('/subscriptions/check/document');
    return response.data;
  },

  /**
   * Check if user can download documents
   */
  async checkDownloadPermission(): Promise<LimitCheckResult> {
    const response = await api.post('/subscriptions/check/download');
    return response.data;
  },

  /**
   * Check if user's subscription is active
   */
  async checkStatus(): Promise<{ active: boolean }> {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  /**
   * Upgrade user subscription
   */
  async upgrade(plan: 'Intango' | 'Inkingi'): Promise<{
    success: boolean;
    message: string;
    subscription: {
      plan: string;
      startDate: string;
      endDate: string;
    };
  }> {
    const response = await api.post('/subscriptions/upgrade', { plan });
    return response.data;
  },

  /**
   * Get features for a specific plan
   */
  async getFeatures(plan: 'Genzura' | 'Intango' | 'Inkingi'): Promise<{
    plan: string;
    features: Record<string, any>;
  }> {
    const response = await api.get(`/subscriptions/features/${plan}`);
    return response.data;
  }
};
