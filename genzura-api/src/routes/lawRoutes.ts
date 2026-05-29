/**
 * Law Routes
 * API endpoints for Rwandan law matching and management
 */

import express from 'express';
import {
  matchLawsToCaseEndpoint,
  getCaseLawsEndpoint,
  addLawToCaseEndpoint,
  removeLawFromCaseEndpoint,
  updateCaseLawEndpoint,
  searchLawsEndpoint,
  getLegalArticleEndpoint,
} from '../controllers/lawController';

const router = express.Router();

// Case-specific law endpoints
router.post('/cases/:caseId/match-laws', matchLawsToCaseEndpoint);
router.get('/cases/:caseId/laws', getCaseLawsEndpoint);
router.post('/cases/:caseId/laws', addLawToCaseEndpoint);
router.put('/cases/:caseId/laws/:lawId', updateCaseLawEndpoint);
router.delete('/cases/:caseId/laws/:lawId', removeLawFromCaseEndpoint);

// General law search and lookup
router.get('/laws/search', searchLawsEndpoint);
router.get('/laws/:articleId', getLegalArticleEndpoint);

export default router;
