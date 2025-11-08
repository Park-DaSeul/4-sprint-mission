import { validateParams } from '../../middlewares/validate.middleware.js';
import { productIdSchema } from '../../common/index.js';
import { checkResourceExists } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateProductId = validateParams(productIdSchema);

// -------------------
// |  Authorization  |
// -------------------

// 상품 존재 확인
export const checkProductExists = checkResourceExists(prisma.product, 'productId');
