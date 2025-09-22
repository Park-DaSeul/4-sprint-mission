import * as productLikeService from './productLikes.service.js';
import type { Request, Response } from 'express';

// 게시글 좋아요 생성 (토글)
export const createProductLike = async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) throw new Error('상품 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const productLike = await productLikeService.createProductLike(productId, userId);

  // 좋아요 취소일 경우와 생성일 경우를 삼항 연산자로 처리
  return productLike === null
    ? res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' })
    : res.status(201).json({ success: true, data: productLike });
};
