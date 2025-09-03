import { z } from 'zod';
import { idSchema, contentSchema } from '../utils/validations.js';

// 모든 게시글 조회 (query)
export const getComments = {
  query: z
    .object({
      cursor: z.uuid().optional(),
      limit: z.coerce.number().min(1).max(100).default(10),
      search: z.string().optional(),
    })
    .strict(),
};

// 특정 게시글 조회 (params)
export const getCommentById = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 게시글 생성 (body)
export const createComment = {
  body: z
    .object({
      content: contentSchema,
    })
    .strict(),
};

// 게시글 수정 (body + params)
export const updateComment = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
  body: z
    .object({
      content: contentSchema.optional(),
    })
    .strict(),
};

// 게시글 삭제 (params)
export const deleteComment = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};
