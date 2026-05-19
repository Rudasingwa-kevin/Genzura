import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { EmailService } from '../services/emailService.js';

const prisma = new PrismaClient();

interface ExpiryCheckResult {
  expired: number;
  warned7Days: number;
  warned3Days: number;
  warned1Day: number;
  errors: string[];
}

export class SubscriptionExpiryJob {
  /**
   * Main job that checks all subscriptions and takes appropriate action
   */
  static async run(): Promise<ExpiryCheckResult> {
    console.log('🔄 Running subscription expiry check...');

    const result: ExpiryCheckResult = {
      expired: 0,
      warned7Days: 0,
      warned3Days: 0,
      warned1Day: 0,
      errors: []
    };

    try {
      const now = new Date();

      // Get all paid users (Intango and Inkingi)
      const paidUsers = await prisma.user.findMany({
        where: {
          subscriptionPlan: {
            in: [SubscriptionPlan.Intango, SubscriptionPlan.Inkingi]
          },
          subscriptionEndDate: {
            not: null
          }
        },
        include: {
          _count: {
            select: {
              cases: true,
              uploadedDocs: true
            }
          }
        }
      });

      console.log(`📊 Found ${paidUsers.length} paid subscriptions to check`);

      for (const user of paidUsers) {
        try {
          if (!user.subscriptionEndDate) continue;

          const endDate = new Date(user.subscriptionEndDate);
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Handle expired subscriptions (including grace period)
          if (daysUntilExpiry < -3) {
            // Grace period ended - downgrade to free tier
            await this.handleExpiredSubscription(user);
            result.expired++;
          } else if (daysUntilExpiry <= 0 && daysUntilExpiry >= -3) {
            // In grace period - send grace period warning
            await this.sendGracePeriodWarning(user, Math.abs(daysUntilExpiry));
          } else if (daysUntilExpiry === 1) {
            // Expires tomorrow
            await this.sendExpiryWarning(user, 1);
            result.warned1Day++;
          } else if (daysUntilExpiry === 3) {
            // Expires in 3 days
            await this.sendExpiryWarning(user, 3);
            result.warned3Days++;
          } else if (daysUntilExpiry === 7) {
            // Expires in 7 days
            await this.sendExpiryWarning(user, 7);
            result.warned7Days++;
          }
        } catch (error: any) {
          const errorMsg = `Failed to process user ${user.email}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }

      console.log('✅ Subscription expiry check completed');
      console.log(`   - Expired & downgraded: ${result.expired}`);
      console.log(`   - 7-day warnings sent: ${result.warned7Days}`);
      console.log(`   - 3-day warnings sent: ${result.warned3Days}`);
      console.log(`   - 1-day warnings sent: ${result.warned1Day}`);
      if (result.errors.length > 0) {
        console.log(`   - Errors: ${result.errors.length}`);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Subscription expiry job failed:', error);
      result.errors.push(`Job failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Downgrade user to free tier (soft limit - no data deletion)
   */
  private static async handleExpiredSubscription(user: any) {
    const previousPlan = user.subscriptionPlan;
    const casesCount = user._count.cases;
    const docsCount = user._count.uploadedDocs;

    // Downgrade to free tier (NO data deletion!)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: SubscriptionPlan.Genzura,
        subscriptionStartDate: null,
        subscriptionEndDate: null
      }
    });

    // Calculate overage
    const caseOverage = Math.max(0, casesCount - 20);
    const docOverage = Math.max(0, docsCount - 20);

    // Send expiration notification
    await EmailService.sendSubscriptionExpiredEmail(
      user.email,
      user.name,
      previousPlan,
      casesCount,
      docsCount,
      caseOverage,
      docOverage
    );

    // TODO: Log audit event when AuditLog model is available
    // await prisma.auditLog.create({ ... });

    console.log(`✅ Downgraded ${user.email} from ${previousPlan} to Genzura (${casesCount} cases, ${docsCount} docs)`);
  }

  /**
   * Send expiry warning email
   */
  private static async sendExpiryWarning(user: any, daysUntil: number) {
    try {
      await EmailService.sendSubscriptionExpiryWarning(
        user.email,
        user.name,
        user.subscriptionPlan,
        user.subscriptionEndDate!,
        daysUntil
      );
      console.log(`📧 Sent ${daysUntil}-day warning to ${user.email}`);
    } catch (error: any) {
      console.error(`❌ Failed to send warning to ${user.email}:`, error.message);
    }
  }

  /**
   * Send grace period warning
   */
  private static async sendGracePeriodWarning(user: any, daysExpired: number) {
    try {
      await EmailService.sendGracePeriodWarning(
        user.email,
        user.name,
        user.subscriptionPlan,
        daysExpired
      );
      console.log(`⚠️ Sent grace period warning to ${user.email} (expired ${daysExpired} days ago)`);
    } catch (error: any) {
      console.error(`❌ Failed to send grace period warning to ${user.email}:`, error.message);
    }
  }

  /**
   * Manual trigger for testing/admin purposes
   */
  static async runManual(): Promise<ExpiryCheckResult> {
    console.log('🔧 Manual subscription expiry check triggered');
    return await this.run();
  }
}
