import prisma from '../libs/prisma.js';
import { getOneByIdOrFail, userSelect, articleSelect, commentSelect } from '../utils/index.js';

// 모든 게시글 조회
export const getArticles = async (query) => {
  const { offset = 0, limit = 10, order = 'recent', search } = query;
  // offset 방식의 페이지 네이션
  let orderBy;
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
  let where = {};

  if (searchKeyword) {
    where = {
      OR: [
        { title: { contains: searchKeyword, mode: 'insensitive' } },
        { content: { contains: searchKeyword, mode: 'insensitive' } },
      ],
    };
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
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
  return articles;
};

// 특정 게시글 조회
export const getArticleById = async (id) => {
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
    },
  });
  if (!article) throw new Error('게시글을 찾을 수 없습니다.');
  return article;
};

// 게시글 생성
export const createArticle = async (userId, data) => {
  const { title, content, imageUrl } = data;

  const article = await prisma.article.create({
    data: {
      title,
      content,
      imageUrl,
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
export const updateArticle = async (id, userId, data) => {
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
export const deleteArticle = async (id, userId) => {
  // 게시글이 존재하는지 확인
  const articleData = await getOneByIdOrFail(prisma.article, id, '게시글');
  if (articleData.userId !== userId) {
    throw new Error('게시글을 삭제할 권한이 없습니다.');
  }

  await prisma.article.delete({
    where: { id },
  });
};
