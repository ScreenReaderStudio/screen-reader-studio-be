import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: '인증되지 않았습니다. 로그인이 필요합니다.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET이 설정되어 있지 않습니다.');

    return res.status(500).json({ message: '서버 설정 오류가 발생했습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch {
    console.error('토큰 검증 실패: 유효하지 않은 토큰');

    return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }
};
