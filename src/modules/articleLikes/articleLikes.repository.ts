import prisma from '../../libs/prisma.js';
import { articleLikeSelect } from '../../utils/index.js';
import type { CreateArticleLikeData } from './articleLikes.dto.js';

// 특정 게시글 좋아요 조회
export const getArticleLikeById = async (articleId: string, userId: string) => {
  const articleLike = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        articleId,
        userId,
      },
    },
  });

  return articleLike;
};

// 게시글 좋아요 생성
export const createArticleLike = async (createData: CreateArticleLikeData) => {
  const articleLike = await prisma.articleLike.create({
    data: createData,
    select: articleLikeSelect,
  });

  return articleLike;
};

// 게시글 좋아요 삭제
export const deleteArticleLike = async (id: string) => {
  return await prisma.articleLike.delete({
    where: { id },
  });
};
