import { Request, Response } from 'express';
import { CaseService } from '../services/caseService.js';

export class CaseController {
  static async getAll(req: any, res: Response) {
    try {
      // All users (including admins) only see their assigned cases
      const userId = req.user?.id;
      const cases = await CaseService.getAllCases(userId);
      res.json(cases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: any, res: Response) {
    try {
      const { id } = req.params;
      const caseItem = await CaseService.getCaseById(id, req.user?.id, req.user?.role);
      if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.json(caseItem);
    } catch (error: any) {
      // Handle permission errors with 403
      if (error.message.includes('permission')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const newCase = await CaseService.createCase({
        ...req.body,
        attorneyId: req.user.id // Automatically assign logged-in user as lead attorney
      });
      res.status(201).json(newCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedCase = await CaseService.updateCaseStatus(id, status);
      res.json(updatedCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addNote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const note = await CaseService.addNote(id, req.user.id, text);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAnalytics(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const analytics = await CaseService.getAnalytics(userId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async addTeamMember(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { userId, message } = req.body;
      const inviterId = req.user.id;

      // Import InvitationService
      const { InvitationService } = await import('../services/invitationService.js');

      // Send invitation instead of directly adding
      const invitation = await InvitationService.createInvitation(
        id,
        userId,
        inviterId,
        'Team Member',
        message
      );

      res.json({
        message: 'Invitation sent successfully. User will be added after approval.',
        invitation
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedCase = await CaseService.updateCase(id, req.body);
      res.json(updatedCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CaseService.deleteCase(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async removeTeamMember(req: any, res: Response) {
    try {
      const { id, userId } = req.params;
      const currentUserId = req.user.id;

      // Get the case to check if current user is the attorney (case creator)
      const caseData = await CaseService.getCaseById(id, currentUserId, req.user?.role);

      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      // Only the lead attorney can remove team members
      if (caseData.attorneyId !== currentUserId) {
        return res.status(403).json({ error: 'Only the case lead attorney can remove team members' });
      }

      // Cannot remove the lead attorney
      if (userId === caseData.attorneyId) {
        return res.status(400).json({ error: 'Cannot remove the lead attorney from the case' });
      }

      await CaseService.removeTeamMember(id, userId);
      res.json({ message: 'Team member removed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
