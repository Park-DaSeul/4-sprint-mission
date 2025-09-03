import { z } from 'zod';
import {
  idSchema,
  nameSchema,
  descriptionSchema,
  priceSchema,
  tagsSchema,
  imageUrlSchema,
} from '../utils/validations.js';

// 모든 상품 조회 (query)
export const getProducts = {
  query: z
    .object({
      offset: z.coerce.number().min(1).max(100).default(0),
      limit: z.coerce.number().min(1).max(100).default(10),
      order: z.string().optional(),
      search: z.string().optional(),
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
      name: nameSchema,
      description: descriptionSchema,
      price: priceSchema,
      tags: tagsSchema,
      imageUrl: imageUrlSchema,
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
      name: nameSchema.optional(),
      description: descriptionSchema.optional(),
      price: priceSchema.optional(),
      tags: tagsSchema.optional(),
      imageUrl: imageUrlSchema.optional(),
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
