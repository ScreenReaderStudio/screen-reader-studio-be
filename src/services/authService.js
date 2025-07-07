import axios from 'axios';
import jwt from 'jsonwebtoken';
import { findOrCreateUserByKakaoId } from './users/userService.js';

const getKakaoTokens = async (code) => {
  const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
    params: {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_REST_API_KEY, // .env 파일의 변수명을 더 명확하게 변경하는 것을 추천합니다.
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code,
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });
  return response.data;
};

const getKakaoUserProfile = async (accessToken) => {
  const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });
  return response.data;
};

export const processKakaoLogin = async (code) => {
  const { access_token } = await getKakaoTokens(code);

  const kakaoProfile = await getKakaoUserProfile(access_token);

  const user = await findOrCreateUserByKakaoId(kakaoProfile);

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return {
    token,
    user: { id: user.id, nickname: user.nickname, email: user.email },
  };
};
