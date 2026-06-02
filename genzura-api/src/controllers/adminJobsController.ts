import { Request, Response } from 'express';
import { SubscriptionExpiryJob } from '../jobs/subscriptionExpiryJob.js';
import { CaseDeadlineJob } from '../jobs/caseDeadlineJob.js';

export class AdminJobsController {
  /**
   * POST /api/admin/jobs/run-expiry-check
   * Manually trigger subscription expiry check (for testing/admin purposes)
   */
  static async runExpiryCheck(req: any, res: Response) {
    try {
      // Only admins can trigger this
      if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      console.log(`🔧 Manual subscription expiry check triggered by ${req.user.email}`);

      const result = await SubscriptionExpiryJob.runManual();

      res.json({
        success: true,
        message: 'Subscription expiry check completed',
        result: {
          expired: result.expired,
          warnings: {
            '7days': result.warned7Days,
            '3days': result.warned3Days,
            '1day': result.warned1Day
          },
          errors: result.errors
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to run expiry check:', error);
      res.status(500).json({
        error: 'Failed to run expiry check',
        details: error.message
      });
    }
  }

  /**
   * POST /api/admin/jobs/run-deadline-check
   * Manually trigger case deadline check (for testing/admin purposes)
   */
  static async runDeadlineCheck(req: any, res: Response) {
    try {
      // Only admins can trigger this
      if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      console.log(`🔧 Manual case deadline check triggered by ${req.user.email}`);

      const result = await CaseDeadlineJob.runManual();

      res.json({
        success: true,
        message: 'Case deadline check completed',
        result: {
          processedCases: result.processedCases,
          alertsSent: result.alertsSent,
          warnings: {
            'expired': result.warnedExpired,
            'today': result.warnedToday,
            '1day': result.warned1Day,
            '3days': result.warned3Days,
            '7days': result.warned7Days
          },
          errors: result.errors
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to run case deadline check:', error);
      res.status(500).json({
        error: 'Failed to run case deadline check',
        details: error.message
      });
    }
  }

  /**
   * GET /api/admin/jobs/status
   * Get status of scheduled jobs
   */
  static async getJobsStatus(req: any, res: Response) {
    try {
      if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      res.json({
        jobs: [
          {
            name: 'Subscription Expiry Check',
            schedule: 'Daily at 2:00 AM (Africa/Kigali)',
            status: 'running',
            description: 'Checks for expired subscriptions and sends warnings'
          },
          {
            name: 'Case Deadline Check',
            schedule: 'Daily at 3:00 AM (Africa/Kigali)',
            status: 'running',
            description: 'Checks for approaching or expired case deadlines and sends alerts'
          }
        ],
        timezone: 'Africa/Kigali'
      });
    } catch (error: any) {
      console.error('❌ Failed to get jobs status:', error);
      res.status(500).json({ error: 'Failed to get jobs status' });
    }
  }
}
