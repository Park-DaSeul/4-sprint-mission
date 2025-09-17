import { z } from 'zod';
import { articleIdSchema } from '../utils/validations.js';

// 게시글 좋아요 생성 (params)
export const createArticleLike = {
  params: z
    .object({
      articleId: articleIdSchema,
    })
    .strict(),
};
