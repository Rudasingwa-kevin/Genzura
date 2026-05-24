import { CaseService } from '../services/caseService.js';
import { SettingsService } from '../services/settingsService.js';
import { SubscriptionService } from '../services/subscriptionService.js';
export class CaseController {
    static async getAll(req, res) {
        try {
            // All users (including admins) only see their assigned cases
            const userId = req.user?.id;
            const cases = await CaseService.getAllCases(userId);
            res.json(cases);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const caseItem = await CaseService.getCaseById(id, req.user?.id, req.user?.role);
            if (!caseItem) {
                return res.status(404).json({ error: 'Case not found' });
            }
            res.json(caseItem);
        }
        catch (error) {
            // Handle permission errors with 403
            if (error.message.includes('permission')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            // Check subscription enforcement
            const subscriptionStatus = await SettingsService.getSubscriptionStatus();
            if (subscriptionStatus === 'ACTIVE') {
                const canCreate = await SubscriptionService.canCreateCase(req.user.id);
                if (!canCreate.allowed) {
                    return res.status(403).json({
                        error: canCreate.message,
                        code: 'SUBSCRIPTION_LIMIT_REACHED',
                        currentCases: canCreate.currentCases,
                        maxCases: canCreate.maxCases
                    });
                }
            }
            const newCase = await CaseService.createCase({
                ...req.body,
                attorneyId: req.user.id // Automatically assign logged-in user as lead attorney
            });
            res.status(201).json(newCase);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user?.id;
            const updatedCase = await CaseService.updateCaseStatus(id, status, userId);
            res.json(updatedCase);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async addNote(req, res) {
        try {
            const { id } = req.params;
            const { text } = req.body;
            const note = await CaseService.addNote(id, req.user.id, text);
            res.status(201).json(note);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getAnalytics(req, res) {
        try {
            const userId = req.user?.id;
            const analytics = await CaseService.getAnalytics(userId);
            res.json(analytics);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async addTeamMember(req, res) {
        try {
            const { id } = req.params;
            const { userId, message } = req.body;
            const inviterId = req.user.id;
            // Import InvitationService
            const { InvitationService } = await import('../services/invitationService.js');
            // Send invitation instead of directly adding
            const invitation = await InvitationService.createInvitation(id, userId, inviterId, 'Team Member', message);
            res.json({
                message: 'Invitation sent successfully. User will be added after approval.',
                invitation
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Get user from auth middleware
            const updatedCase = await CaseService.updateCase(id, req.body, userId);
            res.json(updatedCase);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await CaseService.deleteCase(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async removeTeamMember(req, res) {
        try {
            const { id, userId } = req.params;
            const currentUserId = req.user.id;
            // Get the case to check if current user is the attorney (case creator)
            const caseData = await CaseService.getCaseById(id, currentUserId, req.user?.role);
            if (!caseData) {
                return res.status(404).json({ error: 'Case not found' });
            }
            // Only the lead attorney can remove team members
            if (caseData.attorneyId !== currentUserId) {
                return res.status(403).json({ error: 'Only the case lead attorney can remove team members' });
            }
            // Cannot remove the lead attorney
            if (userId === caseData.attorneyId) {
                return res.status(400).json({ error: 'Cannot remove the lead attorney from the case' });
            }
            await CaseService.removeTeamMember(id, userId, currentUserId);
            res.json({ message: 'Team member removed successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=caseController.js.map