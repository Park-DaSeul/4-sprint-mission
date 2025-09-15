import * as authRepository from './auth.repository.js';
import { hashPassword } from '../../utils/index.js';
import { generateTokens } from '../../libs/token.js';
import type { Tokens } from '../../libs/token.js';
import type { CreateSignupData, CreateSignupRepositoryData } from './auth.dto.js';

// 회원가입
export const signup = async (data: CreateSignupData) => {
  const { email, nickname, imageUrl, password, confirmPassword } = data;

  // 이메일 중복 확인
  const existingUser = await authRepository.checkUserExistsByEmail(email);
  if (existingUser) throw new Error('이미 사용 중인 이메일입니다.');

  // 비밀번호와 재입력 비밀번호가 같은지 확인
  if (password !== confirmPassword) {
    throw new Error('비밀번호가 일치하지 않습니다');
  }

  // 비밀번호 해시 처리
  const hashedPassword = await hashPassword(password);

  const createData: CreateSignupRepositoryData = {
    email,
    nickname,
    imageUrl: imageUrl ?? null,
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
