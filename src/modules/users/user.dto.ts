import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 특정 사용자 조회
export interface GetUserRequest extends AuthenticatedRequest {}

// 사용자 수정
export interface UpdateUserRequest extends AuthenticatedRequest {
  parsedBody: UpdateUserBody;
}

// 사용자 삭제
export interface DeleteUserRequest extends AuthenticatedRequest {
  parsedBody: DeleteUserBody;
}

// 사용자가 등록한 상품 조회
export interface GetUserProductRequest extends AuthenticatedRequest {}

// 사용자가 좋아요 누른 상품 조회
export interface GetUserLikeRequest extends AuthenticatedRequest {}

// --------------------
// |  ZOD SCHEMAS     |
// --------------------

// user
const nicknameSchema = z
  .string()
  .min(1, '닉네임은 최소 1글자 이상이어야 합니다.')
  .max(20, '닉네임은 최대 20글자까지 가능합니다.');
const passwordSchema = z
  .string()
  .min(6, '비밀번호는 최소 6자리 이상이어야 합니다.')
  .max(20, '비밀번호는 최대 20자리까지 가능합니다.');

// 수정 (body)
export const updateUser = z
  .object({
    nickname: nicknameSchema,
    password: passwordSchema.optional(),
    newPassword: passwordSchema.optional(),
    imageId: z.uuid().optional(),
  })
  .strict();

export type UpdateUserBody = z.infer<typeof updateUser>;

// 삭제 (body)
export const deleteUser = z
  .object({
    password: passwordSchema,
  })
  .strict();

export type DeleteUserBody = z.infer<typeof deleteUser>;
