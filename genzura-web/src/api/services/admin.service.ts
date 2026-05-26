import apiClient from '../client';

export const adminService = {
  // Audit logs
  getAuditLogs: (params?: {
    action?: string;
    userId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/admin/audit', { params }).then(res => res.data),

  getAuditStats: () => apiClient.get('/admin/audit/stats').then(res => res.data),

  // License tracking
  getLicenses: () => apiClient.get('/admin/licenses').then(res => res.data),

  // Storage metrics
  getStorageMetrics: () => apiClient.get('/admin/storage').then(res => res.data),

  // System health
  getSystemHealth: () => apiClient.get('/admin/health').then(res => res.data),

  // Infrastructure
  getInfrastructure: () => apiClient.get('/admin/infrastructure').then(res => res.data),
};
