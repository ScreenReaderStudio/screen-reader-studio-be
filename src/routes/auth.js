import express from 'express';

import { handleKakaoLogin, handleLogout } from '../controllers/authController.js';

const router = express.Router();

router.post('/kakao', handleKakaoLogin);
router.post('/logout', handleLogout);

export default router;
