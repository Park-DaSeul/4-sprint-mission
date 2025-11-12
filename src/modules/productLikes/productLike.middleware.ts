import { validateParams } from '../../middlewares/validate.middleware.js';
import { productIdSchema } from '../../common/index.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateProductId = validateParams(productIdSchema);
