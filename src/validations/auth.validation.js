import { z } from 'zod';
import { emailSchema, nicknameSchema, imageSchema, passwordSchema } from '../utils/validations.js';

// 회원가입 (body)
export const signup = {
  body: z
    .object({
      email: emailSchema,
      nickname: nicknameSchema,
      image: imageSchema,
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
