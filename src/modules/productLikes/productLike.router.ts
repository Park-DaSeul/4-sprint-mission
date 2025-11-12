import { Router } from 'express';
import { productLikeController } from './productLike.container.js';
import { validateProductId } from './productLike.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const nestedProductLikeRouter = Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
nestedProductLikeRouter.use(authenticate);

// 상품 좋아요 생성 (토글)
nestedProductLikeRouter.post('/', validateProductId, asyncHandler(productLikeController.createProductLike));

export { nestedProductLikeRouter };
