import { validateParams } from '../../middlewares/validate.middleware.js';
import { articleIdSchema } from '../../common/index.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateArticleId = validateParams(articleIdSchema);
