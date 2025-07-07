import { supabase } from '../supabaseClient.js';

export const findOrCreateUserByKakaoId = async (kakaoProfile) => {
  const { id: kakaoId, properties, kakao_account } = kakaoProfile;
  const nickname = properties?.nickname;
  const email = kakao_account?.email;

  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('kakao_id', kakaoId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`사용자 조회 중 오류 발생: ${error.message}`);
  }

  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ kakao_id: kakaoId, nickname, email }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`사용자 생성 중 오류 발생: ${insertError.message}`);
    }

    user = newUser;
  }

  return user;
};
