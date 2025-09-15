import * as articleLikeRepository from './articleLikes.repository.js';
import type { CreateArticleLikeData } from './articleLikes.dto.js';

// 게시글 좋아요 생성 (토글)
export const createArticleLike = async (articleId: string, userId: string) => {
  // 좋아요 눌렀는지 확인
  const existingLike = await articleLikeRepository.getArticleLikeById(articleId, userId);

  // 좋아요 취소
  if (existingLike) {
    const { id } = existingLike;
    await articleLikeRepository.deleteArticleLike(id);

    return 'canceled';
  }

  // 좋아요 생성
  const createData: CreateArticleLikeData = { articleId, userId };

  const articleLike = await articleLikeRepository.createArticleLike(createData);

  return articleLike;
};
