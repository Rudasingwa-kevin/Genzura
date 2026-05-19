import { AuditService } from '../services/auditService.js';
export class AuditController {
    /**
     * Get all audit logs with optional filters
     */
    static async getAll(req, res) {
        try {
            const { action, userId, status, startDate, endDate, limit = '50', offset = '0', } = req.query;
            const filters = {
                action: action,
                userId: userId,
                status: status,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            };
            const result = await AuditService.getAllLogs(filters);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get logs for a specific user
     */
    static async getUserLogs(req, res) {
        try {
            const { userId } = req.params;
            const { limit = '20' } = req.query;
            const logs = await AuditService.getUserLogs(userId, parseInt(limit, 10));
            res.json(logs);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get recent activity
     */
    static async getRecentActivity(req, res) {
        try {
            const { limit = '50' } = req.query;
            const logs = await AuditService.getRecentActivity(parseInt(limit, 10));
            res.json(logs);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=auditController.js.map