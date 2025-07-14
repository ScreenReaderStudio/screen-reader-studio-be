import express from 'express';

import {
  performAnalysis,
  saveAnalysisResult,
  getAnalysisResult,
} from '../controllers/analysisController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/perform', performAnalysis);
router.post('/', authenticateToken, saveAnalysisResult);
router.get('/:id', getAnalysisResult);

export default router;
