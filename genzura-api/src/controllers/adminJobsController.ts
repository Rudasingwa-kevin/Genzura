import { Request, Response } from 'express';
import { SubscriptionExpiryJob } from '../jobs/subscriptionExpiryJob.js';

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
