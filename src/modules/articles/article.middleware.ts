import { validateParams, validateQuery, validateBody } from '../../middlewares/validate.middleware.js';
import { createArticle, updateArticle } from './article.dto.js';
import { idSchema, offsetSchema } from '../../common/index.js';
import { checkOwnership } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateId = validateParams(idSchema);

// query
export const validateGetQuery = validateQuery(offsetSchema);

// 게시글 생성
export const validateCreateBody = validateBody(createArticle);

// 게시글 수정
export const validateUpdateBody = validateBody(updateArticle);

// -------------------
// |  Authorization  |
// -------------------

// 인가
export const checkArticleOwner = checkOwnership(prisma.article, 'userId', {
  articleImages: true,
});
