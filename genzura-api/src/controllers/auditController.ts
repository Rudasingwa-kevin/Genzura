import { Request, Response } from 'express';
import { AuditService } from '../services/auditService.js';
import { AuditAction, AuditStatus } from '@prisma/client';

export class AuditController {
  /**
   * Get all audit logs with optional filters
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        action,
        userId,
        status,
        startDate,
        endDate,
        limit = '50',
        offset = '0',
      } = req.query;

      const filters = {
        action: action as AuditAction | undefined,
        userId: userId as string | undefined,
        status: status as AuditStatus | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      };

      const result = await AuditService.getAllLogs(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get logs for a specific user
   */
  static async getUserLogs(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { limit = '20' } = req.query;

      const logs = await AuditService.getUserLogs(
        userId,
        parseInt(limit as string, 10)
      );

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(req: Request, res: Response) {
    try {
      const { limit = '50' } = req.query;
      const logs = await AuditService.getRecentActivity(
        parseInt(limit as string, 10)
      );
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
