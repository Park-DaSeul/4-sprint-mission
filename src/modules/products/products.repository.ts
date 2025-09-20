import prisma from '../../libs/prisma.js';
import { userSelect, productSelect, commentSelect } from '../../utils/index.js';
import type { Prisma } from '@prisma/client';
import type { GetProductsRepositoryQuery, CreateProductRepositoryData, UpdateProductData } from './products.dto.js';

// 모든 상품 조회
export const getProducts = async (productsQuery: GetProductsRepositoryQuery, likesQuery: Prisma.ProductInclude) => {
  const products = await prisma.product.findMany({
    ...productsQuery,
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

  return products;
};

// 특정 상품 조회
export const getProductById = async (id: string, userId: string) => {
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

  return product;
};

// 상품 생성
export const createProduct = async (createData: CreateProductRepositoryData) => {
  const product = await prisma.product.create({
    data: createData,
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
export const updateProduct = async (id: string, updateData: Partial<UpdateProductData>) => {
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
export const deleteProduct = async (id: string) => {
  const product = await prisma.product.delete({
    where: { id },
  });

  return product;
};

// 삼품 존재 확인
export const findProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  return product;
};

// 상품 이미지 수정,삭제
export const updateProductImage = async (id: string, updateData: { imageUrl: string | null }) => {
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
