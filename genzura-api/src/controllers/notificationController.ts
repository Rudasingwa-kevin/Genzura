import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  static async getAll(req: any, res: Response) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async markAllRead(req: any, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async dismiss(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await NotificationService.deleteNotification(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
