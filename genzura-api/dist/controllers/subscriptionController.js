import { SubscriptionService } from '../services/subscriptionService.js';
import { SubscriptionPlan } from '@prisma/client';
export class SubscriptionController {
    /**
     * GET /api/subscriptions/limits
     * Get current user's subscription limits and usage
     */
    static async getLimits(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const limits = await SubscriptionService.getSubscriptionLimits(userId);
            res.json(limits);
        }
        catch (error) {
            console.error('Error fetching subscription limits:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch subscription limits' });
        }
    }
    /**
     * POST /api/subscriptions/check/case
     * Check if user can create a new case
     */
    static async checkCaseLimit(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await SubscriptionService.canCreateCase(userId);
            res.json(result);
        }
        catch (error) {
            console.error('Error checking case limit:', error);
            res.status(500).json({ error: error.message || 'Failed to check case limit' });
        }
    }
    /**
     * POST /api/subscriptions/check/document
     * Check if user can upload a document
     */
    static async checkDocumentLimit(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await SubscriptionService.canUploadDocument(userId);
            res.json(result);
        }
        catch (error) {
            console.error('Error checking document limit:', error);
            res.status(500).json({ error: error.message || 'Failed to check document limit' });
        }
    }
    /**
     * POST /api/subscriptions/check/download
     * Check if user can download documents
     */
    static async checkDownloadPermission(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await SubscriptionService.canDownloadDocument(userId);
            res.json(result);
        }
        catch (error) {
            console.error('Error checking download permission:', error);
            res.status(500).json({ error: error.message || 'Failed to check download permission' });
        }
    }
    /**
     * POST /api/subscriptions/upgrade
     * Upgrade user subscription (payment integration would go here)
     */
    static async upgrade(req, res) {
        try {
            const userId = req.user?.id;
            const { plan } = req.body;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
                return res.status(400).json({ error: 'Invalid subscription plan' });
            }
            // Determine duration based on plan
            let duration = 0;
            if (plan === SubscriptionPlan.Intango) {
                duration = 90; // 3 months
            }
            else if (plan === SubscriptionPlan.Inkingi) {
                duration = 365; // 1 year
            }
            // TODO: Integrate with payment gateway (MTN Mobile Money, Airtel Money, etc.)
            // For now, we'll just update the subscription
            const updatedUser = await SubscriptionService.updateSubscription(userId, plan, duration);
            res.json({
                success: true,
                message: 'Subscription updated successfully',
                subscription: {
                    plan: updatedUser.subscriptionPlan,
                    startDate: updatedUser.subscriptionStartDate,
                    endDate: updatedUser.subscriptionEndDate
                }
            });
        }
        catch (error) {
            console.error('Error upgrading subscription:', error);
            res.status(500).json({ error: error.message || 'Failed to upgrade subscription' });
        }
    }
    /**
     * GET /api/subscriptions/features/:plan
     * Get features for a specific plan
     */
    static async getFeatures(req, res) {
        try {
            const { plan } = req.params;
            if (!Object.values(SubscriptionPlan).includes(plan)) {
                return res.status(400).json({ error: 'Invalid subscription plan' });
            }
            const features = SubscriptionService.getFeaturesByPlan(plan);
            res.json({ plan, features });
        }
        catch (error) {
            console.error('Error fetching plan features:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch plan features' });
        }
    }
    /**
     * GET /api/subscriptions/status
     * Check if user's subscription is active
     */
    static async checkStatus(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const isActive = await SubscriptionService.isSubscriptionActive(userId);
            res.json({ active: isActive });
        }
        catch (error) {
            console.error('Error checking subscription status:', error);
            res.status(500).json({ error: error.message || 'Failed to check subscription status' });
        }
    }
}
//# sourceMappingURL=subscriptionController.js.map