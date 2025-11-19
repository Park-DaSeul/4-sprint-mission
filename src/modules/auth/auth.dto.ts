import { z } from 'zod';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../../types/request.type.js';

// ----------
// |  TYPE  |
// ----------

// 회원가입
export interface SignupRequest extends Request {
  parsedBody: SignupBody;
}

// 로그인
export interface LoginRequest extends AuthenticatedRequest {
  parsedBody: LoginBody;
}

// 토큰 재발급
export interface RefreshRequest extends AuthenticatedRequest {
  parsedBody: RefreshBody;
}

// -----------------
// |  ZOD SCHEMAS  |
// -----------------

// auth
const nicknameSchema = z
  .string()
  .min(1, '닉네임은 최소 1글자 이상이어야 합니다.')
  .max(20, '닉네임은 최대 20글자까지 가능합니다.');
const emailSchema = z.email('올바른 이메일 형식이 아닙니다.');
const passwordSchema = z
  .string()
  .min(6, '비밀번호는 최소 6자리 이상이어야 합니다.')
  .max(20, '비밀번호는 최대 20자리까지 가능합니다.');

// 회원가입
export const signup = z
  .object({
    nickname: nicknameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export type SignupBody = z.infer<typeof signup>;

// 로그인
export const login = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export type LoginBody = z.infer<typeof login>;

// 토큰 재발급
export const refresh = z.object({}).strict();

export type RefreshBody = z.infer<typeof refresh>;
