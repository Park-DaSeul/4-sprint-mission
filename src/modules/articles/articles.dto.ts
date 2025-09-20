import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import {
  idSchema,
  titleSchema,
  articleContentSchema,
  offsetSchema,
  limitSchema,
  orderSchema,
  searchSchema,
} from '../../utils/index.js';

export interface GetArticlesQuery {
  offset?: number;
  limit?: number;
  order?: string;
  search?: string;
}

export interface GetArticlesRepositoryQuery {
  where: Prisma.ArticleWhereInput;
  orderBy: Prisma.ArticleOrderByWithRelationInput;
  skip: number;
  take: number;
}

export interface CreateArticleData {
  title: string;
  content: string;
}

export interface CreateArticleRepositoryData extends CreateArticleData {
  userId: string;
}

export interface UpdateArticleData {
  title: string;
  content: string;
}

// 모든 게시글 조회 (query)
export const getArticles = {
  query: z
    .object({
      offset: offsetSchema,
      limit: limitSchema,
      order: orderSchema,
      search: searchSchema,
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
      content: articleContentSchema,
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
      title: titleSchema,
      content: articleContentSchema,
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

// 게시글 이미지 수정
export const updateArticleImage = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 게시글 이미지 삭제
export const deleteArticleImage = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};
