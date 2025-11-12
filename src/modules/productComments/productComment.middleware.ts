import { validateParams, validateQuery, validateBody } from '../../middlewares/validate.middleware.js';
import { createProductComment, updateProductComment } from './productComment.dto.js';
import { idSchema, productIdSchema, cursorSchema } from '../../common/index.js';
import { checkOwnership, checkResourceExists } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateId = validateParams(idSchema);
export const validateProductId = validateParams(productIdSchema);

// query
export const validateGetQuery = validateQuery(cursorSchema);

// 상품 댓글 생성
export const validateCreateBody = validateBody(createProductComment);

// 상품 댓글 수정
export const validateUpdateBody = validateBody(updateProductComment);

// -------------------
// |  Authorization  |
// -------------------

// 상품 존재 확인
export const checkProductExists = checkResourceExists(prisma.product, 'productId');

// 인가
export const checkProductCommentOwner = checkOwnership(prisma.productComment);
