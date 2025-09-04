import { z } from 'zod';
import { nicknameSchema, imageSchema, passwordSchema, emailSchema } from '../utils/validations.js';

// 사용자 수정 (body)
export const updateUser = {
  body: z
    .object({
      email: emailSchema.optional(),
      nickname: nicknameSchema.optional(),
      image: imageSchema.optional(),
      newPassword: passwordSchema.optional(),
      password: passwordSchema,
    })
    .strict(),
};

// 사용자 삭제 (body)
export const deleteUser = {
  body: z
    .object({
      password: passwordSchema,
    })
    .strict(),
};
