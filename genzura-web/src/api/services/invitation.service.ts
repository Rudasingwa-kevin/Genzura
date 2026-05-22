import apiClient from '../client';

export const invitationService = {
  /**
   * Get all pending invitations for the current user
   */
  getMyInvitations: async () => {
    const response = await apiClient.get('/invitations/my-invitations');
    return response.data;
  },

  /**
   * Approve an invitation
   */
  approveInvitation: async (invitationId: string) => {
    const response = await apiClient.post(`/invitations/${invitationId}/approve`);
    return response.data;
  },

  /**
   * Reject an invitation
   */
  rejectInvitation: async (invitationId: string) => {
    const response = await apiClient.post(`/invitations/${invitationId}/reject`);
    return response.data;
  },

  /**
   * Get all invitations for a specific case (admin/case owner)
   */
  getCaseInvitations: async (caseId: string) => {
    const response = await apiClient.get(`/invitations/case/${caseId}`);
    return response.data;
  },
};
