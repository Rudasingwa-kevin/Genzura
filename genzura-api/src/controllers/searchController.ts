import { Request, Response } from 'express';
import { SearchService } from '../services/searchService.js';

export class SearchController {
  static async globalSearch(req: any, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json({ cases: [], users: [], documents: [] });
      }
      const userId = req.user?.id;
      const results = await SearchService.globalSearch(q, userId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
