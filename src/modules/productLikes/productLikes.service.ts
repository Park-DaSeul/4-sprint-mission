import * as productLikeRepository from './productLikes.repository.js';
import type { CreateProductLikeData } from './productLikes.dto.js';

// 상품 좋아요 생성 (토글)
export const createProductLike = async (productId: string, userId: string) => {
  // 좋아요를 눌렀는지 확인
  const existingLike = await productLikeRepository.getProductLikeById(productId, userId);

  // 좋아요 취소
  if (existingLike) {
    const { id } = existingLike;
    await productLikeRepository.deleteProductLike(id);

    return 'canceled';
  }

  // 좋아요 생성
  const createData: CreateProductLikeData = { productId, userId };

  const productLike = await productLikeRepository.createProductLike(createData);

  return productLike;
};
