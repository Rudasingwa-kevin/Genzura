import { PrismaClient, SubscriptionPlan } from '@prisma/client';
const prisma = new PrismaClient();
export class PlanController {
    /**
     * GET /api/admin/plans
     * Get all plan configurations
     */
    static async getAllPlans(req, res) {
        try {
            const adminUser = req.user;
            // Check admin role
            if (adminUser.role !== 'Admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            const plans = await prisma.planConfig.findMany({
                orderBy: { price: 'asc' }
            });
            res.json(plans);
        }
        catch (error) {
            console.error('Error fetching plans:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch plans' });
        }
    }
    /**
     * POST /api/admin/plans
     * Create or update plan configuration
     */
    static async upsertPlan(req, res) {
        try {
            const adminUser = req.user;
            if (adminUser.role !== 'Admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            const planData = req.body;
            if (!planData.plan || !Object.values(SubscriptionPlan).includes(planData.plan)) {
                return res.status(400).json({ error: 'Invalid plan type' });
            }
            // Upsert plan configuration
            const updatedPlan = await prisma.planConfig.upsert({
                where: { plan: planData.plan },
                update: {
                    price: planData.price,
                    duration: planData.duration,
                    displayName: planData.displayName,
                    tagline: planData.tagline,
                    description: planData.description,
                    maxCases: planData.maxCases,
                    maxDocuments: planData.maxDocuments,
                    maxTeamMembers: planData.maxTeamMembers,
                    storageGB: planData.storageGB,
                    features: planData.features,
                    isActive: planData.isActive,
                    isVisible: planData.isVisible,
                    lastModifiedBy: adminUser.email,
                    lastModifiedAt: new Date()
                },
                create: {
                    plan: planData.plan,
                    price: planData.price,
                    duration: planData.duration,
                    displayName: planData.displayName,
                    tagline: planData.tagline || '',
                    description: planData.description || '',
                    maxCases: planData.maxCases,
                    maxDocuments: planData.maxDocuments,
                    maxTeamMembers: planData.maxTeamMembers,
                    storageGB: planData.storageGB,
                    features: planData.features,
                    isActive: planData.isActive ?? true,
                    isVisible: planData.isVisible ?? true,
                    lastModifiedBy: adminUser.email
                }
            });
            // Log admin action
            console.log(`[ADMIN ACTION] ${adminUser.email} updated plan: ${planData.plan}. New price: ${planData.price} RWF, Duration: ${planData.duration} days`);
            res.json({
                success: true,
                message: 'Plan updated successfully',
                plan: updatedPlan
            });
        }
        catch (error) {
            console.error('Error updating plan:', error);
            res.status(500).json({ error: error.message || 'Failed to update plan' });
        }
    }
    /**
     * GET /api/plans/public
     * Get public-facing plan information (for pricing page)
     */
    static async getPublicPlans(req, res) {
        try {
            const plans = await prisma.planConfig.findMany({
                where: {
                    isActive: true,
                    isVisible: true
                },
                orderBy: { price: 'asc' }
            });
            // If no custom plans, return defaults
            if (plans.length === 0) {
                return res.json([
                    {
                        plan: 'Genzura',
                        price: 0,
                        duration: 0,
                        displayName: 'Genzura',
                        tagline: 'Free Forever',
                        description: 'Foundation tier',
                        maxCases: 20,
                        maxDocuments: 20,
                        features: {
                            documentDownload: false,
                            calendarIntegration: 'Basic',
                            notifications: 'Email only',
                            analytics: false,
                            prioritySupport: false,
                            exportReports: false,
                            apiAccess: false,
                            customBranding: false
                        }
                    },
                    {
                        plan: 'Intango',
                        price: 100000,
                        duration: 90,
                        displayName: 'Intango',
                        tagline: 'Most Popular',
                        description: 'Full features - quarterly',
                        maxCases: null,
                        maxDocuments: null,
                        features: {
                            documentDownload: true,
                            calendarIntegration: 'Advanced',
                            notifications: 'Email + SMS',
                            analytics: true,
                            prioritySupport: true,
                            exportReports: true,
                            apiAccess: true,
                            customBranding: true
                        }
                    },
                    {
                        plan: 'Inkingi',
                        price: 250000,
                        duration: 365,
                        displayName: 'Inkingi',
                        tagline: 'Best Value',
                        description: 'Same features - save 37% annually',
                        maxCases: null,
                        maxDocuments: null,
                        features: {
                            documentDownload: true,
                            calendarIntegration: 'Advanced',
                            notifications: 'Email + SMS',
                            analytics: true,
                            prioritySupport: true,
                            exportReports: true,
                            apiAccess: true,
                            customBranding: true
                        }
                    }
                ]);
            }
            res.json(plans);
        }
        catch (error) {
            console.error('Error fetching public plans:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch plans' });
        }
    }
}
//# sourceMappingURL=planController.js.map