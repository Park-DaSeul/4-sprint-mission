import prisma from '../libs/prisma.js';
import { getOneByIdOrFail } from '../utils/index.js';

// 모든 상품 조회
export const getProducts = async (query) => {
  const { offset = 0, limit = 10, order = 'recent', search } = query;
  // offset 방식의 페이지 네이션
  let orderBy;
  switch (order) {
    case 'old':
      orderBy = { createdAt: 'asc' };
      break;
    case 'recent':
    default:
      orderBy = { createdAt: 'desc' };
  }
  // 검색 기능 추가
  const searchKeyword = search;
  let where = {};

  if (searchKeyword) {
    where = {
      OR: [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ],
    };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  return products;
};

// 특정 상품 조회
export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) throw new Error('상품을 찾을 수 없습니다.');
  return product;
};

// 상품 생성
export const createProduct = async (userId, data) => {
  const { name, description, price, tags, imageUrl } = data;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      tags,
      imageUrl,
      userId,
    },
  });
  return product;
};

// 상품 수정
export const updateProduct = async (id, userId, data) => {
  const { name, description, price, tags, imageUrl } = data;
  // 상품이 존재하는지 확인
  const productData = await getOneByIdOrFail(prisma.product, id, '상품');
  if (productData.userId !== userId) {
    throw new Error('상품을 수정할 권한이 없습니다.');
  }

  const updateData = {
    ...(name && { name }),
    ...(description && { description }),
    ...(price && { price }),
    ...(tags && { tags }),
    ...(imageUrl && { imageUrl }),
  };

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });
  return product;
};

// 상품 삭제
export const deleteProduct = async (id, userId) => {
  // 상품이 존재하는지 확인
  const productData = await getOneByIdOrFail(prisma.product, id, '상품');
  if (productData.userId !== userId) {
    throw new Error('상품을 삭제할 권한이 없습니다.');
  }

  await prisma.product.delete({
    where: { id },
  });
};
