import { SearchService } from '../services/searchService.js';
export class SearchController {
    static async globalSearch(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.json({ cases: [], users: [], documents: [] });
            }
            const results = await SearchService.globalSearch(q);
            res.json(results);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=searchController.js.map