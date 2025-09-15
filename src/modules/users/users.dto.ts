import { z } from 'zod';
import { nicknameSchema, imageUrlSchema, passwordSchema, emailSchema } from '../../utils/index.js';

export interface UpdateUserData {
  nickname?: string;
  imageUrl?: string;
  password: string;
  newPassword?: string;
}

export interface UpdateUserRepositoryData {
  nickname?: string;
  imageUrl?: string;
  password?: string;
}

export interface DeleteUserData {
  password: string;
}

// 사용자 수정 (body)
export const updateUser = {
  body: z
    .object({
      email: emailSchema,
      nickname: nicknameSchema,
      imageUrl: imageUrlSchema,
      newPassword: passwordSchema,
      password: passwordSchema,
    })
    .partial()
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
