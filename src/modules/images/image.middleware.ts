import { validateBody } from '../../middlewares/validate.middleware.js';
import { createImage } from './image.dto.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// 사진 생성 (업로드)
export const validateCreateBody = validateBody(createImage);
