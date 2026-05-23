import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
  /**
   * Check if user can create a new case based on their subscription plan
   */
  static async canCreateCase(userId: string): Promise<{ allowed: boolean; message?: string; currentCases?: number; maxCases?: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { cases: true }
        }
      }
    });

    if (!user) {
      return { allowed: false, message: 'User not found' };
    }

    const caseCount = user._count.cases;
    const now = new Date();

    // Check if user has an active paid subscription (Intango or Inkingi)
    const hasActivePaidSubscription =
      (user.subscriptionPlan === SubscriptionPlan.Intango || user.subscriptionPlan === SubscriptionPlan.Inkingi) &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > now;

    // If they have an active paid subscription, allow unlimited cases
    if (hasActivePaidSubscription) {
      return { allowed: true };
    }

    // Free tier or expired subscription: enforce 20-case limit
    const FREE_TIER_LIMIT = 20;

    if (caseCount >= FREE_TIER_LIMIT) {
      return {
        allowed: false,
        message: `You have reached the limit of ${FREE_TIER_LIMIT} cases. Please upgrade to Intango or Inkingi for unlimited cases.`,
        currentCases: caseCount,
        maxCases: FREE_TIER_LIMIT
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can upload a new document based on their subscription plan
   */
  static async canUploadDocument(userId: string): Promise<{ allowed: boolean; message?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { allowed: false, message: 'User not found' };
    }

    const now = new Date();

    // Check if user has an active paid subscription
    const hasActivePaidSubscription =
      (user.subscriptionPlan === SubscriptionPlan.Intango || user.subscriptionPlan === SubscriptionPlan.Inkingi) &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > now;

    // If they have an active paid subscription, allow uploads
    if (hasActivePaidSubscription) {
      return { allowed: true };
    }

    // If on free tier (never subscribed or no expiry date), allow uploads
    if (user.subscriptionPlan === SubscriptionPlan.Genzura && !user.subscriptionEndDate) {
      return { allowed: true };
    }

    // Expired subscription: block document uploads
    return {
      allowed: false,
      message: 'Your subscription has expired. Please renew to upload documents.'
    };
  }

  /**
   * Check if user can download documents based on their subscription plan
   */
  static async canDownloadDocument(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Free plan (Genzura) cannot download documents
    if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
      return {
        allowed: false,
        reason: 'Document downloads not available on free plan. Upgrade to Intango or Inkingi.'
      };
    }

    // Intango and Inkingi can download documents
    return { allowed: true };
  }

  /**
   * Get subscription limits for a user
   */
  static async getSubscriptionLimits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            cases: true,
            uploadedDocs: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();

    // Check if paid subscription is active
    const hasActivePaidSubscription =
      (user.subscriptionPlan === SubscriptionPlan.Intango || user.subscriptionPlan === SubscriptionPlan.Inkingi) &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > now;

    // If subscription expired, treat as free tier
    const effectivePlan = hasActivePaidSubscription ? user.subscriptionPlan : SubscriptionPlan.Genzura;
    const isExpired = user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now;

    const limits = {
      plan: user.subscriptionPlan,
      effectivePlan,
      isExpired,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      daysRemaining: user.subscriptionEndDate
        ? Math.max(0, Math.ceil((new Date(user.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null,
      cases: {
        current: user._count.cases,
        limit: effectivePlan === SubscriptionPlan.Genzura ? 20 : null, // null means unlimited
        canCreate: true
      },
      documents: {
        current: user._count.uploadedDocs,
        canUpload: true,
        canDownload: effectivePlan !== SubscriptionPlan.Genzura
      }
    };

    // Check if limits are reached for free tier or expired subscriptions
    if (effectivePlan === SubscriptionPlan.Genzura) {
      limits.cases.canCreate = user._count.cases < 20;
      limits.documents.canUpload = !isExpired; // Expired users can't upload
    }

    return limits;
  }

  /**
   * Update user subscription plan
   */
  static async updateSubscription(userId: string, plan: SubscriptionPlan, durationDays: number) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    return prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      }
    });
  }

  /**
   * Check if subscription is active
   */
  static async isSubscriptionActive(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Free plan is always active
    if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
      return true;
    }

    // Check if paid subscription has expired
    if (user.subscriptionEndDate) {
      return new Date() < user.subscriptionEndDate;
    }

    return false;
  }

  /**
   * Get subscription features based on plan
   */
  static getFeaturesByPlan(plan: SubscriptionPlan) {
    const features = {
      [SubscriptionPlan.Genzura]: {
        cases: 20,
        documents: 20,
        documentDownload: false,
        collaborators: 1,
        storage: '500 MB',
        analytics: false,
        prioritySupport: false,
        apiAccess: false
      },
      [SubscriptionPlan.Intango]: {
        cases: 'Unlimited',
        documents: 'Unlimited',
        documentDownload: true,
        collaborators: 5,
        storage: '50 GB',
        analytics: true,
        prioritySupport: true,
        apiAccess: false
      },
      [SubscriptionPlan.Inkingi]: {
        cases: 'Unlimited',
        documents: 'Unlimited',
        documentDownload: true,
        collaborators: 'Unlimited',
        storage: '500 GB',
        analytics: true,
        prioritySupport: true,
        apiAccess: true
      }
    };

    return features[plan];
  }
}
