import { InvitationService } from '../services/invitationService.js';
export class InvitationController {
    /**
     * Get all invitations for the current user
     */
    static async getMyInvitations(req, res) {
        try {
            const userId = req.user.id;
            const invitations = await InvitationService.getUserInvitations(userId);
            res.json(invitations);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Approve an invitation
     */
    static async approveInvitation(req, res) {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;
            const result = await InvitationService.approveInvitation(invitationId, userId);
            res.json({ message: 'Invitation approved', data: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * Reject an invitation
     */
    static async rejectInvitation(req, res) {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;
            const result = await InvitationService.rejectInvitation(invitationId, userId);
            res.json({ message: 'Invitation rejected', data: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * Get invitations for a specific case (admin/case owner only)
     */
    static async getCaseInvitations(req, res) {
        try {
            const { caseId } = req.params;
            const invitations = await InvitationService.getCaseInvitations(caseId);
            res.json(invitations);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=invitationController.js.map