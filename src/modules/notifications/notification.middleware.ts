import { validateParams, validateQuery } from '../../middlewares/validate.middleware.js';
import { idSchema, cursorNotificationSchema } from '../../common/index.js';
import { checkOwnership } from '../../middlewares/ownership.middleware.js';
import prisma from '../../lib/prisma.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateId = validateParams(idSchema);

// query
export const validateGetQuery = validateQuery(cursorNotificationSchema);

// -------------------
// |  Authorization  |
// -------------------

// 인가
export const checkNotificationOwner = checkOwnership(prisma.notification, 'recipientId');
