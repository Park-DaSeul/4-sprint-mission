import { z } from 'zod';
import { idSchema, contentSchema, cursorSchema, limitSchema, searchSchema } from '../utils/validations.js';

// 모든 댓글 조회 (query)
export const getComments = {
  query: z
    .object({
      cursor: cursorSchema,
      limit: limitSchema,
      search: searchSchema,
    })
    .strict(),
};

// 특정 댓글 조회 (params)
export const getCommentById = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 댓글 생성 (body)
export const createComment = {
  body: z
    .object({
      content: contentSchema,
    })
    .strict(),
};

// 댓글 수정 (body + params)
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

// 댓글 삭제 (params)
export const deleteComment = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};
