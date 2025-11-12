import { z } from 'zod';

// id
export const idSchema = z
  .object({
    id: z.uuid('유효한 ID를 입력하세요.'),
  })
  .strict();

export type IdParams = z.infer<typeof idSchema>;

// productId
export const productIdSchema = z
  .object({
    productId: z.uuid('유효한 ID를 입력하세요.'),
  })
  .strict();

export type ProductIdParams = z.infer<typeof productIdSchema>;

// articleId
export const articleIdSchema = z
  .object({
    articleId: z.uuid('유효한 ID를 입력하세요.'),
  })
  .strict();

export type ArticleIdParams = z.infer<typeof articleIdSchema>;
