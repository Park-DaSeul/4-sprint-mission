import { z } from 'zod';
import { emailSchema, nicknameSchema, imageUrlSchema, passwordSchema } from '../../utils/index.js';

export interface CreateSignupData {
  email: string;
  nickname: string;
  imageUrl?: string | null;
  password: string;
  confirmPassword: string;
}

export interface CreateSignupRepositoryData {
  email: string;
  nickname: string;
  imageUrl?: string | null;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RefreshData {
  refreshToken: string;
}

// 회원가입 (body)
export const signup = {
  body: z
    .object({
      email: emailSchema,
      nickname: nicknameSchema,
      imageUrl: imageUrlSchema,
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .strict(),
};

// 로그인 (body)
export const login = {
  body: z
    .object({
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
};

// 토큰 재발급 (body)
export const refresh = {
  body: z.object({}).strict(),
};
