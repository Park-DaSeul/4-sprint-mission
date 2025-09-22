import * as articleRepository from './articles.repository.js';
import type { Prisma } from '@prisma/client';
import type {
  GetArticlesQuery,
  GetArticlesRepositoryQuery,
  CreateArticleData,
  CreateArticleRepositoryData,
  UpdateArticleData,
} from './articles.dto.js';
import { deleteFile } from '../../utils/index.js';

// 모든 게시글 조회
export const getArticles = async (query: GetArticlesQuery, userId: string | null) => {
  const { offset: skip = 0, limit: take = 10, order = 'recent', search } = query;

  // 페이지 네이션 offset 방식
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
  let where: Prisma.ArticleWhereInput = {};
  if (search) {
    where = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // userId가 유효할 때만 필터를 적용하는 객체 생성
  const likesQuery: Prisma.ArticleInclude = userId ? { likes: { where: { userId }, select: { id: true } } } : {};
  const articlesQuery: GetArticlesRepositoryQuery = { where, orderBy, skip, take };

  const articles = await articleRepository.getArticles(articlesQuery, likesQuery);

  // isLiked로 좋아요를 불리언 값으로 변환
  const articlesData = articles.map((article) => {
    const isLiked = article.likes?.length > 0;
    // likes 필드를 제거하고 isLiked 필드를 추가
    const { likes, ...rest } = article;
    return { ...rest, isLiked };
  });

  return articlesData;
};

// 특정 게시글 조회
export const getArticleById = async (id: string, userId: string) => {
  const article = await articleRepository.getArticleById(id, userId);
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
  const { title, content } = data;

  const createData: CreateArticleRepositoryData = {
    title,
    content,
    userId,
  };

  const article = await articleRepository.createArticle(createData);

  return article;
};

// 게시글 수정
export const updateArticle = async (id: string, userId: string, data: UpdateArticleData) => {
  const { title, content } = data;

  // 게시글 존재 확인
  const articleData = await articleRepository.findArticle(id);
  if (!articleData) throw new Error('게시글을 찾을 수 없습니다.');
  if (articleData.userId !== userId) throw new Error('게시글을 수정할 권한이 없습니다.');

  // 기존 데이터와 새 데이터 비교
  const updateData: Partial<UpdateArticleData> = {
    ...(title !== articleData.title && { title }),
    ...(content !== articleData.content && { content }),
  };

  if (Object.keys(updateData).length === 0) {
    throw new Error('수정할 내용이 없습니다.');
  }

  const article = await articleRepository.updateArticle(id, updateData);

  return article;
};

// 게시글 삭제
export const deleteArticle = async (id: string, userId: string) => {
  // 게시글 존재 확인
  const articleData = await articleRepository.findArticle(id);
  if (!articleData) throw new Error('게시글을 찾을 수 없습니다.');
  if (articleData.userId !== userId) throw new Error('게시글을 삭제할 권한이 없습니다.');

  await articleRepository.deleteArticle(id);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (articleData.imageUrl) {
    await deleteFile(articleData.imageUrl);
  }

  return;
};

// 게시글 이미지 수정
export const updateArticleImage = async (id: string, userId: string, imageUrl: string) => {
  // 게시글 존재 확인
  const articleData = await articleRepository.findArticle(id);
  if (!articleData) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('게시글을 찾을 수 없습니다.');
  }
  if (articleData.userId !== userId) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('게시글을 수정할 권한이 없습니다.');
  }
  if (!imageUrl) throw new Error('수정할 이미지가 없습니다.');

  const updateData = { imageUrl };

  const article = await articleRepository.updateArticleImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (articleData.imageUrl) {
    await deleteFile(articleData.imageUrl);
  }

  return article;
};

// 게시글 이미지 삭제
export const deleteArticleImage = async (id: string, userId: string) => {
  // 게시글 존재 확인
  const articleData = await articleRepository.findArticle(id);
  if (!articleData) throw new Error('게시글을 찾을 수 없습니다.');
  if (articleData.userId !== userId) throw new Error('게시글을 수정할 권한이 없습니다.');

  const updateData = { imageUrl: null };

  await articleRepository.updateArticleImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (articleData.imageUrl) {
    await deleteFile(articleData.imageUrl);
  }

  return;
};
