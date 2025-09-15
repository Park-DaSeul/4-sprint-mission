import * as articleLikeService from './articleLikes.service.js';
import type { Request, Response } from 'express';

// 게시글 좋아요 생성 (토글)
export const createArticleLike = async (req: Request, res: Response) => {
  const { articleId } = req.params;
  if (!articleId) throw new Error('게시글 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const articleLike = await articleLikeService.createArticleLike(articleId, userId);

  // 좋아요 취소일 경우와 생성일 경우를 삼항 연산자로 처리
  return typeof articleLike === 'string' && articleLike === 'canceled'
    ? res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' })
    : res.status(201).json({ success: true, data: articleLike });
};
