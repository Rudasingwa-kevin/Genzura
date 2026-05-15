import { NotificationService } from '../services/notificationService.js';
export class NotificationController {
    static async getAll(req, res) {
        try {
            const notifications = await NotificationService.getUserNotifications(req.user.id);
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async markRead(req, res) {
        try {
            const { id } = req.params;
            const updated = await NotificationService.markAsRead(id);
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async markAllRead(req, res) {
        try {
            await NotificationService.markAllAsRead(req.user.id);
            res.json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async dismiss(req, res) {
        try {
            const { id } = req.params;
            await NotificationService.deleteNotification(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=notificationController.js.map