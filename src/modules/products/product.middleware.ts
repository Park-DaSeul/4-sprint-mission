import { validateParams, validateQuery, validateBody } from '../../middlewares/validate.middleware.js';
import { createProduct, updateProduct } from './product.dto.js';
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

// 상품 생성
export const validateCreateBody = validateBody(createProduct);

// 상품 수정
export const validateUpdateBody = validateBody(updateProduct);

// -------------------
// |  Authorization  |
// -------------------

// 인가
export const checkProductOwner = checkOwnership(prisma.product);
