import { PrismaClient, SubscriptionPlan } from '@prisma/client';
const prisma = new PrismaClient();
export class SubscriptionService {
    /**
     * Check if user can create a new case based on their subscription plan
     */
    static async canCreateCase(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { cases: true }
                }
            }
        });
        if (!user) {
            return { allowed: false, reason: 'User not found' };
        }
        // Free plan (Genzura) has a limit of 20 cases
        if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
            const caseCount = user._count.cases;
            if (caseCount >= 20) {
                return {
                    allowed: false,
                    reason: 'Free plan limit reached. Upgrade to create unlimited cases.',
                    currentCount: caseCount,
                    limit: 20
                };
            }
        }
        // Intango and Inkingi have unlimited cases
        return { allowed: true };
    }
    /**
     * Check if user can upload a new document based on their subscription plan
     */
    static async canUploadDocument(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { uploadedDocs: true }
                }
            }
        });
        if (!user) {
            return { allowed: false, reason: 'User not found' };
        }
        // Free plan (Genzura) has a limit of 20 documents
        if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
            const docCount = user._count.uploadedDocs;
            if (docCount >= 20) {
                return {
                    allowed: false,
                    reason: 'Free plan limit reached. Upgrade to upload unlimited documents.',
                    currentCount: docCount,
                    limit: 20
                };
            }
        }
        // Intango and Inkingi have unlimited documents
        return { allowed: true };
    }
    /**
     * Check if user can download documents based on their subscription plan
     */
    static async canDownloadDocument(userId) {
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
    static async getSubscriptionLimits(userId) {
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
        const limits = {
            plan: user.subscriptionPlan,
            subscriptionStartDate: user.subscriptionStartDate,
            subscriptionEndDate: user.subscriptionEndDate,
            cases: {
                current: user._count.cases,
                limit: user.subscriptionPlan === SubscriptionPlan.Genzura ? 20 : null, // null means unlimited
                canCreate: true
            },
            documents: {
                current: user._count.uploadedDocs,
                limit: user.subscriptionPlan === SubscriptionPlan.Genzura ? 20 : null,
                canUpload: true,
                canDownload: user.subscriptionPlan !== SubscriptionPlan.Genzura
            }
        };
        // Check if limits are reached
        if (user.subscriptionPlan === SubscriptionPlan.Genzura) {
            limits.cases.canCreate = user._count.cases < 20;
            limits.documents.canUpload = user._count.uploadedDocs < 20;
        }
        return limits;
    }
    /**
     * Update user subscription plan
     */
    static async updateSubscription(userId, plan, durationDays) {
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
    static async isSubscriptionActive(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user)
            return false;
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
    static getFeaturesByPlan(plan) {
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
//# sourceMappingURL=subscriptionService.js.map