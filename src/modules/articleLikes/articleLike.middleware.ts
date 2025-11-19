import { validateParams } from '../../middlewares/validate.middleware.js';
import { articleIdSchema } from '../../common/index.js';
import { checkResourceExists } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateArticleId = validateParams(articleIdSchema);

// -------------------
// |  Authorization  |
// -------------------

// 게시글 존재 확인
export const checkArticleExists = checkResourceExists(prisma.article, 'articleId');
