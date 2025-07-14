import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authenticateToken } from './middleware/authMiddleware.js';
import authRouter from './routes/auth.js';
import analysisRouter from './routes/analysis.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/analysis', analysisRouter);

app.get('/api/users/me', authenticateToken, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
