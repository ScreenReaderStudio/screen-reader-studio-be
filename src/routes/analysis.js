import express from 'express';

import { handleAnalysisRequest } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/', handleAnalysisRequest);

export default router;
