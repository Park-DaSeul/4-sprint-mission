import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import type { IdParams, ArticleIdParams, CursorQuery } from '../../common/index.js';
import type { ArticleComment } from '@prisma/client';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 게시글 모든 댓글 조회
export interface GetArticleCommentsRequest extends AuthenticatedRequest {
  parsedParams: ArticleIdParams;
  parsedQuery: CursorQuery;
}

// 게시글 특정 댓글 조회
export interface GetArticleCommentByIdRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// 게시글 댓글 생성
export interface CreateArticleCommentRequest extends AuthenticatedRequest {
  parsedParams: ArticleIdParams;
  parsedBody: CreateArticleCommentBody;
}

// 게시글 댓글 수정
export interface UpdateArticleCommentRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
  parsedBody: UpdateArticleCommentBody;
  resource: ArticleComment;
}

// 게시글 댓글 삭제
export interface DeleteArticleCommentRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// --------------------
// |  ZOD SCHEMAS     |
// --------------------

// comment
export const contentShema = z
  .string()
  .min(1, '댓글은 최소 1글자 이상이어야 합니다.')
  .max(600, '댓은 최대 500글자까지 가능합니다.');

// 게시글 댓글 생성
export const createArticleComment = z
  .object({
    content: contentShema,
  })
  .strict();

export type CreateArticleCommentBody = z.infer<typeof createArticleComment>;

// 게시글 댓글 수정
export const updateArticleComment = createArticleComment;

export type UpdateArticleCommentBody = z.infer<typeof updateArticleComment>;
