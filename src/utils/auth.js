import bcrypt from 'bcrypt';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, NODE_ENV } from '../libs/constants.js';

// 비밀번호 확인
export const verifyPassword = async (plainPassword, hashedPassword) => {
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  if (!isValid) throw new Error('비밀번호가 일치하지 않습니다.');
};

// 비밀번호를 해시 처리하여 반환
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 토큰 발급 및 쿠키 설정
export const tokensAndSetCookies = (res, accessToken, refreshToken) => {
  // Access Token 쿠키 설정
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 1 * 60 * 60 * 1000, // 1시간
  });

  // Refresh Token 쿠키 설정
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    path: '/auth/refresh',
  });
};
