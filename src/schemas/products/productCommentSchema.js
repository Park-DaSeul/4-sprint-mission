import { z } from 'zod';
import { productIdSchema } from './productSchema';

export const createProductCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: '댓글 내용을 작성하세요.' })
    .max(500, { message: '댓글 내용은 500자를 초과할 수 없습니다.' }),
});

export const updateProductCommentSchema = createProductCommentSchema.partial();

export const commentIdSchema = z.object({
  id: z.uuid({ message: '유효하지 않은 댓글 ID 형식입니다.' }),
});

export const productCommentParamsSchema = z.intersection(
  productIdSchema,
  commentIdSchema,
);
