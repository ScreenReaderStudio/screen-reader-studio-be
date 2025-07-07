import axios from 'axios';
import jwt from 'jsonwebtoken';

import { findOrCreateUserByKakaoId } from './users/userService.js';

const getKakaoTokens = async (code) => {
  try {
    const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      },
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    return response.data;
  } catch (error) {
    console.error('카카오 토큰 가져오는 중 에러 발생:', error.response?.data || error.message);
    throw new Error('카카오 토큰 가져오는 중 에러 발생');
  }
};

const getKakaoUserProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      '카카오 사용자 프로필 가져오는 중 에러 발생:',
      error.response?.data || error.message
    );
    throw new Error('카카오 사용자 프로필 가져오는 중 에러 발생');
  }
};

export const processKakaoLogin = async (code) => {
  try {
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
  } catch (error) {
    console.error('카카오 로그인 처리 중 에러 발생:', error.message);
    throw error;
  }
};
