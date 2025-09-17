import prisma from '../libs/prisma.js';
import { articleLikeSelect } from '../utils/prismaSelects.js';

// 게시글 좋아요 생성 (토글)
export const createArticleLike = async (articleId, userId) => {
  // 좋아요를 눌렀는지 확인
  const existingLike = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        articleId,
        userId,
      },
    },
  });

  if (existingLike) {
    // 좋아요 취소
    await prisma.articleLike.delete({
      where: { id: existingLike.id },
    });
    return 'canseled';
  }
  // 좋아요 생성
  const articleLike = await prisma.articleLike.create({
    data: {
      articleId,
      userId,
    },
    select: articleLikeSelect,
  });
  return articleLike;
};
