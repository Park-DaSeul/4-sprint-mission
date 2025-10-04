import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import type { IdParams, ProductIdParams, CursorQuery } from '../../common/index.js';
import type { ProductComment } from '@prisma/client';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 상품 모든 댓글 조회
export interface GetProductCommentsRequest extends AuthenticatedRequest {
  parsedParams: ProductIdParams;
  parsedQuery: CursorQuery;
}

// 상품 특정 댓글 조회
export interface GetProductCommentByIdRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// 상품 댓글 생성
export interface CreateProductCommentRequest extends AuthenticatedRequest {
  parsedParams: ProductIdParams;
  parsedBody: CreateProductCommentBody;
}

// 상품 댓글 수정
export interface UpdateProductCommentRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
  parsedBody: UpdateProductCommentBody;
  resource: ProductComment;
}

// 상품 댓글 삭제
export interface DeleteProductCommentRequest extends AuthenticatedRequest {
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

// 상품 댓글 생성
export const createProductComment = z
  .object({
    content: contentShema,
  })
  .strict();

export type CreateProductCommentBody = z.infer<typeof createProductComment>;

// 상품 댓글 수정
export const updateProductComment = createProductComment;

export type UpdateProductCommentBody = z.infer<typeof updateProductComment>;
