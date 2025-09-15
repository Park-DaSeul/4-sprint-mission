import prisma from '../../libs/prisma.js';
import { productLikeSelect } from '../../utils/index.js';
import type { CreateProductLikeData } from './productLikes.dto.js';

// 특정 상품 좋아요 조회
export const getProductLikeById = async (productId: string, userId: string) => {
  const productLike = await prisma.productLike.findUnique({
    where: {
      userId_productId: {
        productId,
        userId,
      },
    },
  });

  return productLike;
};

// 상품 좋아요 생성
export const createProductLike = async (createData: CreateProductLikeData) => {
  const productLike = await prisma.productLike.create({
    data: createData,
    select: productLikeSelect,
  });

  return productLike;
};

// 상품 좋아요 삭제
export const deleteProductLike = async (id: string) => {
  return await prisma.productLike.delete({
    where: { id },
  });
};
