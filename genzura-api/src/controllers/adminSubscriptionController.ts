import { Request, Response } from 'express';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminSubscriptionController {
  /**
   * POST /api/admin/subscriptions/grant
   * Admin grants free access/trial to a user
   */
  static async grantAccess(req: Request, res: Response) {
    try {
      const adminUser = (req as any).user;

      // Verify admin role
      if (adminUser.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, plan, durationDays, reason } = req.body;

      if (!userId || !plan || !durationDays) {
        return res.status(400).json({ error: 'userId, plan, and durationDays are required' });
      }

      if (!Object.values(SubscriptionPlan).includes(plan)) {
        return res.status(400).json({ error: 'Invalid subscription plan' });
      }

      // Get user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(durationDays));

      // Update user subscription
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: plan,
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate
        }
      });

      // Log admin action (you can create a separate AdminAction log table)
      console.log(`[ADMIN ACTION] ${adminUser.email} granted ${plan} access to ${user.email} for ${durationDays} days. Reason: ${reason || 'N/A'}`);

      // TODO: Create audit log entry
      // await prisma.adminAuditLog.create({...})

      res.json({
        success: true,
        message: `Successfully granted ${plan} access for ${durationDays} days`,
        subscription: {
          userId: updatedUser.id,
          plan: updatedUser.subscriptionPlan,
          startDate: updatedUser.subscriptionStartDate,
          endDate: updatedUser.subscriptionEndDate
        }
      });
    } catch (error: any) {
      console.error('Error granting subscription access:', error);
      res.status(500).json({ error: error.message || 'Failed to grant access' });
    }
  }

  /**
   * POST /api/admin/subscriptions/extend
   * Admin extends existing subscription
   */
  static async extendSubscription(req: Request, res: Response) {
    try {
      const adminUser = (req as any).user;

      // Verify admin role
      if (adminUser.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, extensionDays, reason } = req.body;

      if (!userId || !extensionDays) {
        return res.status(400).json({ error: 'userId and extensionDays are required' });
      }

      // Get user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has a paid subscription
      if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
        return res.status(400).json({ error: 'Cannot extend free plan. Use "grant access" instead.' });
      }

      // Calculate new end date
      let newEndDate: Date;
      if (user.subscriptionEndDate) {
        // Extend from current end date
        newEndDate = new Date(user.subscriptionEndDate);
        newEndDate.setDate(newEndDate.getDate() + parseInt(extensionDays));
      } else {
        // No end date set, extend from now
        newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + parseInt(extensionDays));
      }

      // Update user subscription
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionEndDate: newEndDate
        }
      });

      // Log admin action
      console.log(`[ADMIN ACTION] ${adminUser.email} extended subscription for ${user.email} by ${extensionDays} days. Reason: ${reason || 'N/A'}`);

      // TODO: Create audit log entry
      // await prisma.adminAuditLog.create({...})

      res.json({
        success: true,
        message: `Successfully extended subscription by ${extensionDays} days`,
        subscription: {
          userId: updatedUser.id,
          plan: updatedUser.subscriptionPlan,
          startDate: updatedUser.subscriptionStartDate,
          endDate: updatedUser.subscriptionEndDate
        }
      });
    } catch (error: any) {
      console.error('Error extending subscription:', error);
      res.status(500).json({ error: error.message || 'Failed to extend subscription' });
    }
  }

  /**
   * POST /api/admin/subscriptions/revoke
   * Admin revokes subscription (downgrade to free)
   */
  static async revokeAccess(req: Request, res: Response) {
    try {
      const adminUser = (req as any).user;

      // Verify admin role
      if (adminUser.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, reason } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Get user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Downgrade to free plan
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: SubscriptionPlan.Genzura,
          subscriptionStartDate: null,
          subscriptionEndDate: null
        }
      });

      // Log admin action
      console.log(`[ADMIN ACTION] ${adminUser.email} revoked subscription for ${user.email}. Reason: ${reason || 'N/A'}`);

      res.json({
        success: true,
        message: 'Successfully revoked subscription',
        subscription: {
          userId: updatedUser.id,
          plan: updatedUser.subscriptionPlan
        }
      });
    } catch (error: any) {
      console.error('Error revoking subscription:', error);
      res.status(500).json({ error: error.message || 'Failed to revoke access' });
    }
  }

  /**
   * GET /api/admin/subscriptions/stats
   * Get subscription statistics for admin dashboard
   */
  static async getStats(req: Request, res: Response) {
    try {
      const adminUser = (req as any).user;

      if (adminUser.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const users = await prisma.user.findMany({
        select: {
          subscriptionPlan: true,
          subscriptionEndDate: true
        }
      });

      const stats = users.reduce((acc: any, user) => {
        const plan = user.subscriptionPlan || 'Genzura';
        acc[plan.toLowerCase()] = (acc[plan.toLowerCase()] || 0) + 1;

        // Check expiring soon (within 30 days)
        if (user.subscriptionEndDate) {
          const daysUntilExpiry = Math.floor(
            (new Date(user.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            acc.expiringSoon = (acc.expiringSoon || 0) + 1;
          }
          if (daysUntilExpiry <= 0) {
            acc.expired = (acc.expired || 0) + 1;
          }
        }

        return acc;
      }, { genzura: 0, intango: 0, inkingi: 0, expiringSoon: 0, expired: 0 });

      // Calculate revenue
      const mrr = (stats.intango * 33333) + (stats.inkingi * 16667);
      const arr = (stats.intango * 100000 * 4) + (stats.inkingi * 200000);

      res.json({
        total: users.length,
        plans: {
          genzura: stats.genzura,
          intango: stats.intango,
          inkingi: stats.inkingi
        },
        revenue: {
          mrr,
          arr
        },
        alerts: {
          expiringSoon: stats.expiringSoon,
          expired: stats.expired
        }
      });
    } catch (error: any) {
      console.error('Error fetching subscription stats:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
  }
}
