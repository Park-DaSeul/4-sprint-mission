import prisma from '../../libs/prisma.js';
import { userSelect, articleSelect, commentSelect } from '../../utils/index.js';
import type { Prisma } from '@prisma/client';
import type { GetArticlesRepositoryQuery, CreateArticleRepositoryData, UpdateArticleData } from './articles.dto.js';

// 모든 게시글 조회
export const getArticles = async (articlesQuery: GetArticlesRepositoryQuery, likesQuery: Prisma.ArticleInclude) => {
  const articles = await prisma.article.findMany({
    ...articlesQuery,
    select: {
      ...articleSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
      ...likesQuery,
    },
  });

  return articles;
};

// 특정 게시글 조회
export const getArticleById = async (id: string, userId: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      ...articleSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
      likes: {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return article;
};

// 게시글 생성
export const createArticle = async (createData: CreateArticleRepositoryData) => {
  const article = await prisma.article.create({
    data: createData,
    select: {
      ...articleSelect,
      user: {
        select: userSelect,
      },
    },
  });

  return article;
};

// 게시글 수정
export const updateArticle = async (id: string, updateData: UpdateArticleData) => {
  const article = await prisma.article.update({
    where: { id },
    data: updateData,
    select: {
      ...articleSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
    },
  });

  return article;
};

// 게시글 삭제
export const deleteArticle = async (id: string) => {
  return await prisma.article.delete({
    where: { id },
  });
};

// 게시글 존재 확인
export const findArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  return article;
};
