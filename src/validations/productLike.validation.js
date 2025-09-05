import { z } from 'zod';
import { productIdSchema } from '../utils/validations.js';

// 상품 좋아요 생성 (params)
export const createProductLike = {
  params: z
    .object({
      productId: productIdSchema,
    })
    .strict(),
};
