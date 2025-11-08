import { z } from 'zod';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../../types/request.type.js';
import type { IdParams, OffsetQuery } from '../../common/index.js';
import type { Article } from '@prisma/client';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 모든 게시글 조회
export interface GetArticlesRequest extends OptionalAuthRequest {
  parsedQuery: OffsetQuery;
}

// 특정 계시글 조회
export interface GetArticleByIdRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// 게시글 생성
export interface CreateArticleRequest extends AuthenticatedRequest {
  parsedBody: CreateArticleBody;
}

// 게시글 수정
export interface UpdateArticleRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
  parsedBody: UpdateArticleBody;
  resource: Article;
}

// 게시글 삭제
export interface DeleteArticleRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// --------------------
// |  ZOD SCHEMAS     |
// --------------------

// article
const titleSchema = z
  .string()
  .min(1, '제목은 최소 1글자 이상이어야 합니다.')
  .max(100, '제목은 최대 100글자까지 가능합니다.');
const contentSchema = z
  .string()
  .min(1, '내용은 최소 1글자 이상이어야 합니다.')
  .max(1000, '내용은 최대 1000글자까지 가능합니다.');
const imageIddsSchema = z
  .array(
    z
      .object({
        id: z.uuid(),
      })
      .strict(),
  )
  .min(1, '이미지는 최소 1개 이상이어야 합니다.')
  .max(5, '이미지는 최대 5개까지 가능합니다.');

// 게시글 생성
export const createArticle = z
  .object({
    title: titleSchema,
    content: contentSchema,
    imageIds: imageIddsSchema.optional(),
  })
  .strict();

export type CreateArticleBody = z.infer<typeof createArticle>;

// 게시글 수정
export const updateArticle = createArticle;

export type UpdateArticleBody = z.infer<typeof updateArticle>;
