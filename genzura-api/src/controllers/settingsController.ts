import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService.js';

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getAllSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const settings = req.body;
      const updated = await SettingsService.upsertSettings(settings);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
