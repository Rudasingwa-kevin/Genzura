import { Request, Response } from 'express';
import { InvitationService } from '../services/invitationService.js';

export class InvitationController {
  /**
   * Get all invitations for the current user
   */
  static async getMyInvitations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invitations = await InvitationService.getUserInvitations(userId);
      res.json(invitations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Approve an invitation
   */
  static async approveInvitation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { invitationId } = req.params;
      const result = await InvitationService.approveInvitation(invitationId, userId);
      res.json({ message: 'Invitation approved', data: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Reject an invitation
   */
  static async rejectInvitation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { invitationId } = req.params;
      const result = await InvitationService.rejectInvitation(invitationId, userId);
      res.json({ message: 'Invitation rejected', data: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get invitations for a specific case (admin/case owner only)
   */
  static async getCaseInvitations(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const invitations = await InvitationService.getCaseInvitations(caseId);
      res.json(invitations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
