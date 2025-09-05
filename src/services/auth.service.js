import prisma from '../libs/prisma.js';
import { hashPassword, checkUserExistsByEmail, userSelect } from '../utils/index.js';
import { generateTokens } from '../libs/token.js';

// 회원가입
export const signup = async (data) => {
  const { email, nickname, imageUrl, password, confirmPassword } = data;

  // 이메일 중복 확인
  const existingUser = await checkUserExistsByEmail(email);
  if (existingUser) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  // 비밀번호 같은지 확인
  if (password !== confirmPassword) {
    throw new Error('비밀번호가 일치하지 않습니다');
  }

  // 비밀번호 해시 처리
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      nickname,
      imageUrl,
      password: hashedPassword,
    },
    select: userSelect,
  });
  return user;
};

// 로그인, 토큰 재발금
export const login = (userId) => {
  return generateTokens(userId);
};

// 토큰 재발금
export const refresh = (userId) => {
  return generateTokens(userId);
};
