import { z } from 'zod';
import { idSchema, titleSchema, contentSchema, imageUrlSchema } from '../utils/validations.js';

// 모든 게시글 조회 (query)
export const getArticles = {
  query: z
    .object({
      offset: z.coerce.number().min(1).max(100).default(0),
      limit: z.coerce.number().min(1).max(100).default(10),
      order: z.string().optional(),
      search: z.string().optional(),
    })
    .strict(),
};

// 특정 게시글 조회 (params)
export const getArticleById = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 게시글 생성 (body)
export const createArticle = {
  body: z
    .object({
      title: titleSchema,
      content: contentSchema,
      imageUrl: imageUrlSchema,
    })
    .strict(),
};

// 게시글 수정 (body + params)
export const updateArticle = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
  body: z
    .object({
      title: titleSchema.optional(),
      content: contentSchema.optional(),
      imageUrl: imageUrlSchema.optional(),
    })
    .strict(),
};

// 게시글 삭제 (params)
export const deleteArticle = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};
