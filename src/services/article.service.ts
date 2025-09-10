import prisma from '../libs/prisma.js';
import { getOneByIdOrFail, userSelect, articleSelect, commentSelect } from '../utils/index.js';
import type { Prisma } from '@prisma/client';

interface GetArticlesQuery {
  offset?: number;
  limit?: number;
  order?: string;
  search?: string;
}

interface CreateArticleData {
  title: string;
  content: string;
  imageUrl?: string;
}

interface UpdateArticleData {
  title?: string;
  content?: string;
  imageUrl?: string;
}

// 모든 게시글 조회
export const getArticles = async (query: GetArticlesQuery, userId: string | null) => {
  const { offset = 0, limit = 10, order = 'recent', search } = query;
  // offset 방식의 페이지 네이션
  let orderBy: Prisma.ArticleOrderByWithRelationInput;
  switch (order) {
    case 'old':
      orderBy = { createdAt: 'asc' };
      break;
    case 'recent':
    default:
      orderBy = { createdAt: 'desc' };
  }
  // 검색 기능 추가
  const searchKeyword = search;
  let where: Prisma.ArticleWhereInput = {};

  if (searchKeyword) {
    where = {
      OR: [
        { title: { contains: searchKeyword, mode: 'insensitive' } },
        { content: { contains: searchKeyword, mode: 'insensitive' } },
      ],
    };
  }

  // userId가 유효할 때만 필터를 적용하는 객체 생성
  const likesQuery = userId ? { likes: { where: { userId }, select: { id: true } } } : {};

  const articles = await prisma.article.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit,
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

  // isLiked로 좋아요를 불리언 값으로 변환
  const articlesData = articles.map((article) => {
    const isLiked = article.likes ? article.likes.length > 0 : false;
    // likes 필드를 제거하고 isLiked 필드를 추가
    const { likes, ...rest } = article;
    return { ...rest, isLiked };
  });

  return articlesData;
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
  if (!article) throw new Error('게시글을 찾을 수 없습니다.');

  // isLiked로 좋아요를 불리언 값으로 변환
  const isLiked = article.likes.length > 0;
  // likes 필드를 제거하고 isLiked 필드를 추가
  const { likes, ...rest } = article;
  const articleData = { ...rest, isLiked };

  return articleData;
};

// 게시글 생성
export const createArticle = async (userId: string, data: CreateArticleData) => {
  const { title, content, imageUrl } = data;

  const article = await prisma.article.create({
    data: {
      title,
      content,
      imageUrl: imageUrl ?? null,
      userId,
    },
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
export const updateArticle = async (id: string, userId: string, data: UpdateArticleData) => {
  const { title, content, imageUrl } = data;
  // 게시글이 존재하는지 확인
  const articleData = await getOneByIdOrFail(prisma.article, id, '게시글');
  if (articleData.userId !== userId) {
    throw new Error('게시글을 수정할 권한이 없습니다.');
  }

  const updateData = {
    ...(title && { title }),
    ...(content && { content }),
    ...(imageUrl && { imageUrl }),
  };

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
export const deleteArticle = async (id: string, userId: string) => {
  // 게시글이 존재하는지 확인
  const articleData = await getOneByIdOrFail(prisma.article, id, '게시글');
  if (articleData.userId !== userId) {
    throw new Error('게시글을 삭제할 권한이 없습니다.');
  }

  await prisma.article.delete({
    where: { id },
  });
};
