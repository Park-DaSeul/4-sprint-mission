import prisma from '../libs/prisma.js';
import { getOneByIdOrFail, userSelect, productSelect, commentSelect } from '../utils/index.js';

// 모든 상품 조회
export const getProducts = async (query, userId) => {
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

  // userId가 유효할 때만 필터를 적용하는 객체 생성
  const likesQuery = userId ? { likes: { where: { userId }, select: { id: true } } } : {};

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
    select: {
      ...productSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
      ...likesQuery,
    },
  });

  // isLiked로 좋아요를 불리언 값으로 변환
  const productsData = products.map((product) => {
    const isLiked = product.likes ? product.likes.length > 0 : false;
    // likes 필드를 제거하고 isLiked 필드를 추가
    const { likes, ...rest } = product;
    return { ...rest, isLiked };
  });

  return productsData;
};

// 특정 상품 조회
export const getProductById = async (id, userId) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      ...productSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
      likes: {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      },
    },
  });
  if (!product) throw new Error('상품을 찾을 수 없습니다.');

  // isLiked로 좋아요를 불리언 값으로 변환
  const isLiked = product.likes.length > 0;
  // likes 필드를 제거하고 isLiked 필드를 추가
  const { likes, ...rest } = product;
  const productData = { ...rest, isLiked };

  return productData;
};

// 상품 생성
export const createProduct = async (userId, data) => {
  const { productName, description, price, tags, imageUrl } = data;

  const product = await prisma.product.create({
    data: {
      productName,
      description,
      price,
      tags,
      imageUrl,
      userId,
    },
    select: {
      ...productSelect,
      user: {
        select: userSelect,
      },
    },
  });
  return product;
};

// 상품 수정
export const updateProduct = async (id, userId, data) => {
  const { productName, description, price, tags, imageUrl } = data;
  // 상품이 존재하는지 확인
  const productData = await getOneByIdOrFail(prisma.product, id, '상품');
  if (productData.userId !== userId) {
    throw new Error('상품을 수정할 권한이 없습니다.');
  }

  const updateData = {
    ...(productName && { productName }),
    ...(description && { description }),
    ...(price && { price }),
    ...(tags && { tags }),
    ...(imageUrl && { imageUrl }),
  };

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    select: {
      ...productSelect,
      user: {
        select: userSelect,
      },
      comments: {
        select: commentSelect,
      },
    },
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
