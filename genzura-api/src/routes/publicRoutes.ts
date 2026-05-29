/**
 * Public Routes
 * API endpoints that don't require authentication
 */

import express from 'express';
import {
  getPublicAttorneys,
  getPublicAttorneyById,
  getAttorneyLocations,
  contactAttorney,
} from '../controllers/publicController';

const router = express.Router();

// Attorney directory endpoints (no auth required)
router.get('/attorneys', getPublicAttorneys);
router.get('/attorneys/:id', getPublicAttorneyById);
router.get('/attorney-locations', getAttorneyLocations);
router.post('/contact-attorney', contactAttorney);

export default router;
