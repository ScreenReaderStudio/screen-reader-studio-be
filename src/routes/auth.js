import express from 'express';
import { handleKakaoLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/kakao', handleKakaoLogin);

export default router;
