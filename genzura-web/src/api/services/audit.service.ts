const API_URL = 'http://localhost:5000/api';

export type AuditLog = {
  id: string;
  action: string;
  description: string;
  userId?: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'Success' | 'Failed';
  metadata?: any;
  createdAt: string;
};

export type AuditLogsResponse = {
  logs: AuditLog[];
  total: number;
};

export const auditService = {
  /**
   * Get all audit logs
   */
  async getAllLogs(filters?: {
    action?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_URL}/audit?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return response.json();
  },

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit = 50): Promise<AuditLog[]> {
    const response = await fetch(`${API_URL}/audit/recent?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    return response.json();
  },

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(userId: string, limit = 20): Promise<AuditLog[]> {
    const response = await fetch(`${API_URL}/audit/user/${userId}?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user audit logs');
    }

    return response.json();
  },
};
