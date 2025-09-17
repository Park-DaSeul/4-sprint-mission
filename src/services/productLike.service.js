import prisma from '../libs/prisma.js';
import { productLikeSelect } from '../utils/prismaSelects.js';

// 상품 좋아요 생성 (토글)
export const createProductLike = async (productId, userId) => {
  // 좋아요를 눌렀는지 확인
  const existingLike = await prisma.productLike.findUnique({
    where: {
      userId_productId: {
        productId,
        userId,
      },
    },
  });

  if (existingLike) {
    // 좋아요 취소
    await prisma.productLike.delete({
      where: { id: existingLike.id },
    });
    return 'canseled';
  }
  // 좋아요 생성
  const productLike = await prisma.productLike.create({
    data: {
      productId,
      userId,
    },
    select: productLikeSelect,
  });
  return productLike;
};
