import { Router } from 'express';
import { productImageController } from './productImage.container.js';
import { productImageUpload } from './productImage.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const productImageRouter = Router();

// --- 여기부터 로그인 필요 ---
productImageRouter.use(authenticate);

// 상품 사진 생성 (업로드)
productImageRouter.post('/', productImageUpload, asyncHandler(productImageController.createProductImage));

export { productImageRouter };
