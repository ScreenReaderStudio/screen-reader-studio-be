import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: '인증되지 않았습니다. 로그인이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('토큰 검증 실패:', error);

    return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }
};
