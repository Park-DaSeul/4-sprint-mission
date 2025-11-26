import { Router } from 'express';
import { articleImageController } from './articleImage.container.js';
import { articleImageUpload } from './articleImage.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const articleImageRouter = Router();

// --- 여기부터 로그인 필요 ---
articleImageRouter.use(authenticate);

// 게시글 사진 생성 (업로드)
articleImageRouter.post('/', articleImageUpload, asyncHandler(articleImageController.createArticleImage));

export { articleImageRouter };
