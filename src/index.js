import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.get('/api/users/me', (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: '인증되지 않았습니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ userId: decoded.userId });
  } catch (error) {
    console.error(error);

    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
