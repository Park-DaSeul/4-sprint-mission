import { z } from 'zod';
import {
  idSchema,
  titleSchema,
  articleContentSchema,
  imageUrlSchema,
  offsetSchema,
  limitSchema,
  orderSchema,
  searchSchema,
} from '../utils/validations.js';

// 모든 게시글 조회 (query)
export const getArticles = z
  .object({
    query: z
      .object({
        offset: offsetSchema,
        limit: limitSchema,
        order: orderSchema,
        search: searchSchema,
      })
      .strict(),
  })
  .strict();

// 특정 게시글 조회 (params)
export const getArticleById = z
  .object({
    params: z
      .object({
        id: idSchema,
      })
      .strict(),
  })
  .strict();

// 게시글 생성 (body)
export const createArticle = z
  .object({
    body: z
      .object({
        title: titleSchema,
        content: articleContentSchema,
        imageUrl: imageUrlSchema,
      })
      .strict(),
  })
  .strict();

// 게시글 수정 (body + params)
export const updateArticle = z
  .object({
    params: z
      .object({
        id: idSchema,
      })
      .strict(),
    body: z
      .object({
        title: titleSchema.optional(),
        content: articleContentSchema.optional(),
        imageUrl: imageUrlSchema.optional(),
      })
      .strict(),
  })
  .strict();

// 게시글 삭제 (params)
export const deleteArticle = z
  .object({
    params: z
      .object({
        id: idSchema,
      })
      .strict(),
  })
  .strict();
