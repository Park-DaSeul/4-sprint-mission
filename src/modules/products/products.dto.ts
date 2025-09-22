import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import {
  idSchema,
  productNameSchema,
  descriptionSchema,
  priceSchema,
  tagsSchema,
  offsetSchema,
  limitSchema,
  orderSchema,
  searchSchema,
} from '../../utils/index.js';

export interface GetProductsQuery {
  offset?: number;
  limit?: number;
  order?: string;
  search?: string;
}

export interface GetProductsRepositoryQuery {
  where: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput;
  skip: number;
  take: number;
}

export interface CreateProductData {
  productName: string;
  description: string;
  price: number;
  tags: string[];
  imageUrl: string | null;
}

export interface CreateProductRepositoryData extends CreateProductData {
  userId: string;
}

export interface UpdateProductData {
  productName: string;
  description: string;
  price: number;
  tags: string[];
}

// 모든 상품 조회 (query)
export const getProducts = {
  query: z
    .object({
      offset: offsetSchema,
      limit: limitSchema,
      order: orderSchema,
      search: searchSchema,
    })
    .strict(),
};

// 특정 상품 조회 (params)
export const getProductById = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 상품 생성 (body)
export const createProduct = {
  body: z
    .object({
      productName: productNameSchema,
      description: descriptionSchema,
      price: priceSchema,
      tags: tagsSchema,
    })
    .strict(),
};

// 상품 수정 (body + params)
export const updateProduct = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
  body: z
    .object({
      productName: productNameSchema,
      description: descriptionSchema,
      price: priceSchema,
      tags: tagsSchema,
    })
    .strict(),
};

// 상품 삭제 (params)
export const deleteProduct = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 상품 이미지 수정
export const updateProductImage = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};

// 상품 이미지 삭제
export const deleteProductImage = {
  params: z
    .object({
      id: idSchema,
    })
    .strict(),
};
