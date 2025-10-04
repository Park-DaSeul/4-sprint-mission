import { z } from 'zod';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../../middlewares/auth.middleware.js';
import type { IdParams, OffsetQuery } from '../../common/index.js';
import type { Product } from '@prisma/client';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 모든 상품 조회
export interface GetProductsRequest extends OptionalAuthRequest {
  parsedQuery: OffsetQuery;
}

// 특정 상품 조회
export interface GetProductByIdRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// 상품 생성
export interface CreateProductRequest extends AuthenticatedRequest {
  parsedBody: CreateProductBody;
}

// 상품 수정
export interface UpdateProductRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
  parsedBody: UpdateProductBody;
  resource: Product;
}

// 상품 삭제
export interface DeleteProductRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}
// --------------------
// |  ZOD SCHEMAS     |
// --------------------

// product
const nameSchema = z
  .string()
  .min(1, '상품 이름은 최소 1글자 이상이어야 합니다.')
  .max(100, '상품 이름은 최대 100글자까지 가능합니다.');
const descriptionSchema = z
  .string()
  .min(1, '상품 설명은 최소 1글자 이상이어야 합니다.')
  .max(1000, '상품 설명은 최대 1000글자까지 가능합니다.');
const priceSchema = z.number().nonnegative();

const tagsSchema = z
  .array(z.string())
  .max(5, '태그는 최대 5개까지 가능합니다.')
  // 태그 배열의 각 항목에서 공백을 제거하고 빈 문자열을 필터링합니다.
  .transform((tags) => tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
  // transform 이후에 배열이 비어있지 않은지 확인합니다.
  .refine((tags) => tags.length > 0, {
    message: '태그를 최소 1개 이상 입력해야 합니다.',
  });
const imageIddsSchema = z
  .array(
    z
      .object({
        id: z.uuid(),
      })
      .strict(),
  )
  .min(1, '이미지는 최소 1개 이상이어야 합니다.')
  .max(5, '이미지는 최대 5개까지 가능합니다.');

// 상품 생성
export const createProduct = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    price: priceSchema,
    tags: tagsSchema,
    imageIds: imageIddsSchema,
  })
  .strict();

export type CreateProductBody = z.infer<typeof createProduct>;

// 상품 수정
export const updateProduct = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    price: priceSchema,
    tags: tagsSchema,
  })
  .strict();

export type UpdateProductBody = z.infer<typeof updateProduct>;
