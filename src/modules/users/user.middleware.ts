import { validateParams, validateQuery, validateBody } from '../../middlewares/validate.middleware.js';
import { updateUser, deleteUser } from './user.dto.js';
import { idSchema, offsetSchema } from '../../common/index.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// id
export const validateId = validateParams(idSchema);

// query
export const validateGetQuery = validateQuery(offsetSchema);

// 사용자 수정
export const validateUpdateBody = validateBody(updateUser);

// 사용자 삭제
export const validateDeleteBody = validateBody(deleteUser);
