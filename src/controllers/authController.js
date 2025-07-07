import { processKakaoLogin } from '../services/authService.js';

export const handleKakaoLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: '인가 코드가 필요합니다.' });
    }

    const { token, user } = await processKakaoLogin(code);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 * 24,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('카카오 로그인 처리 중 에러 발생:', error);

    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};
