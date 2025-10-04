import { validateParams, validateQuery, validateBody } from '../../middlewares/validate.middleware.js';
import { createArticleComment, updateArticleComment } from './articleComment.dto.js';
import { idSchema, articleIdSchema, cursorSchema } from '../../common/index.js';
import { checkOwnership, checkResourceExists } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateId = validateParams(idSchema);
export const validateArticleId = validateParams(articleIdSchema);

// query
export const validateGetQuery = validateQuery(cursorSchema);

// 게시글 댓글 생성
export const validateCreateBody = validateBody(createArticleComment);

// 게시글 댓글 수정
export const validateUpdateBody = validateBody(updateArticleComment);

// -------------------
// |  Authorization  |
// -------------------

// 게시글 존재 확인
export const checkArticleExists = checkResourceExists(prisma.article, 'articleId');

// 인가
export const checkArticleCommentOwner = checkOwnership(prisma.articleComment);
