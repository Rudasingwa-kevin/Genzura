import { FeedbackService } from '../services/feedbackService.js';
export class FeedbackController {
    static async create(req, res) {
        try {
            const { subject, category, message } = req.body;
            const feedback = await FeedbackService.createFeedback(req.user.id, {
                subject,
                category,
                message
            });
            res.status(201).json(feedback);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getAll(req, res) {
        try {
            const feedback = await FeedbackService.getAllFeedback();
            res.json(feedback);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getMyFeedback(req, res) {
        try {
            const feedback = await FeedbackService.getUserFeedback(req.user.id);
            res.json(feedback);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await FeedbackService.updateStatus(id, status);
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=feedbackController.js.map