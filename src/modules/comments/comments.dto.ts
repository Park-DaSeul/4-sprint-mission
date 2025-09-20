import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { idSchema, commentContentSchema, cursorSchema, limitSchema, searchSchema } from '../../utils/validations.js';

export interface GetCommentsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
}

export interface GetCommentsRepositoryQuery {
  where: Prisma.CommentWhereInput;
  take: number;
  cursor?: Prisma.CommentWhereUniqueInput;
  orderBy: Prisma.CommentOrderByWithRelationInput;
  skip: number;
}

export interface CreateCommentData {
  resourceType: 'ARTICLE' | 'PRODUCT';
  content: string;
}

export interface CreateCommentRepositoryData {
  type: 'ARTICLE' | 'PRODUCT';
  content: string;
  articleId?: string;
  productId?: string;
  userId: string;
}

export interface UpdateCommentData {
  content: string;
}

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
      content: commentContentSchema,
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
      content: commentContentSchema,
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
