import { Router } from 'express';
import { imageController } from './image.container.js';
import { validateCreateBody } from './image.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const imageRouter = Router();

// --- 여기부터 로그인 필요 ---
imageRouter.use(authenticate);

// 사진 생성 (업로드)
imageRouter.post('/upload', validateCreateBody, asyncHandler(imageController.createImage));

export { imageRouter };
