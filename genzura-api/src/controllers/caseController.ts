import { Request, Response } from 'express';
import { CaseService } from '../services/caseService.js';

export class CaseController {
  static async getAll(req: Request, res: Response) {
    try {
      const cases = await CaseService.getAllCases();
      res.json(cases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const caseItem = await CaseService.getCaseById(id);
      if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.json(caseItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const newCase = await CaseService.createCase({
        ...req.body,
        attorneyId: req.user.id // Assigning the current user as the attorney by default or from body
      });
      res.status(201).json(newCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedCase = await CaseService.updateCaseStatus(id, status);
      res.json(updatedCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addNote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const note = await CaseService.addNote(id, req.user.id, text);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await CaseService.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async addTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const caseItem = await CaseService.addTeamMember(id, userId);
      res.json(caseItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
