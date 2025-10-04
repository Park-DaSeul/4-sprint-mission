import { ProductLikeService } from './productLike.service.js';
import type { Response } from 'express';
import type { createProductLikeRequest } from './productLike.dto.js';

export class ProductLikeController {
  constructor(private productLikeService: ProductLikeService) {}

  // 상품 좋아요 생성 (토글)
  public createProductLike = async (req: createProductLikeRequest, res: Response) => {
    const { productId } = req.parsedParams;

    const userId = req.user.id;

    const productLike = await this.productLikeService.createProductLike(productId, userId);

    // 좋아요 취소일 경우와 생성일 경우를 삼항 연산자로 처리
    return productLike === null
      ? res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' })
      : res.status(201).json({ success: true, data: productLike });
  };
}
