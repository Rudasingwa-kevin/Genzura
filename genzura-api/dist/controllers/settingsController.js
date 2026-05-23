import { SettingsService } from '../services/settingsService.js';
export class SettingsController {
    static async getSettings(req, res) {
        try {
            const settings = await SettingsService.getAllSettings();
            res.json(settings);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateSettings(req, res) {
        try {
            const settings = req.body;
            const updated = await SettingsService.upsertSettings(settings);
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Subscription system management
    static async getSubscriptionInfo(req, res) {
        try {
            const info = await SettingsService.getSubscriptionInfo();
            res.json(info);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async activateSubscriptionSystem(req, res) {
        try {
            const result = await SettingsService.activateSubscriptionSystem();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async pauseSubscriptionSystem(req, res) {
        try {
            const result = await SettingsService.pauseSubscriptionSystem();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=settingsController.js.map