import * as authRepository from './auth.repository.js';
import { hashPassword } from '../../utils/index.js';
import { generateTokens } from '../../libs/token.js';
import type { Tokens } from '../../libs/token.js';
import type { CreateSignupData } from './auth.dto.js';

// 회원가입
export const signup = async (data: CreateSignupData) => {
  const { email, nickname, password } = data;

  // 이메일 중복 확인
  const existingUser = await authRepository.checkUserExistsByEmail(email);
  if (existingUser) throw new Error('이미 사용 중인 이메일입니다.');

  // 비밀번호 해시 처리
  const hashedPassword = await hashPassword(password);

  const createData: CreateSignupData = {
    email,
    nickname,
    password: hashedPassword,
  };

  const user = await authRepository.signup(createData);

  return user;
};

// 로그인
export const login = (userId: string): Tokens => {
  return generateTokens(userId);
};

// 토큰 재발금
export const refresh = (userId: string): Tokens => {
  return generateTokens(userId);
};
