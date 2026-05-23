import { Request, Response } from 'express';
import { NotificationPreferenceService } from '../services/notificationPreferenceService.js';

export class NotificationPreferenceController {
  /**
   * Get current user's notification preferences
   */
  static async getPreferences(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const preferences = await NotificationPreferenceService.getPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update current user's notification preferences
   */
  static async updatePreferences(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { caseAssignments, timelineMilestones, documentActivity, securityAlerts } = req.body;

      const preferences = await NotificationPreferenceService.updatePreferences(userId, {
        caseAssignments,
        timelineMilestones,
        documentActivity,
        securityAlerts,
      });

      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
