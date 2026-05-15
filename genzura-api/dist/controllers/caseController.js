import { CaseService } from '../services/caseService.js';
export class CaseController {
    static async getAll(req, res) {
        try {
            const cases = await CaseService.getAllCases();
            res.json(cases);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const caseItem = await CaseService.getCaseById(id);
            if (!caseItem) {
                return res.status(404).json({ error: 'Case not found' });
            }
            res.json(caseItem);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            const newCase = await CaseService.createCase({
                ...req.body,
                attorneyId: req.user.id // Assigning the current user as the attorney by default or from body
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
            const updatedCase = await CaseService.updateCaseStatus(id, status);
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
            const analytics = await CaseService.getAnalytics();
            res.json(analytics);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async addTeamMember(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            const caseItem = await CaseService.addTeamMember(id, userId);
            res.json(caseItem);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=caseController.js.map