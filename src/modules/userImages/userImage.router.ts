import { Router } from 'express';
import { userImageController } from './userImage.container.js';
import { userImageUpload } from './userImage.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const userImageRouter = Router();

// --- 여기부터 로그인 필요 ---
userImageRouter.use(authenticate);

// 사용자 사진 생성 (업로드)
userImageRouter.post('/', userImageUpload, asyncHandler(userImageController.createUserImage));

export { userImageRouter };
