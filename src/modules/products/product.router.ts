import { Router } from 'express';
import { productController } from './product.container.js';
import {
  validateId,
  validateGetQuery,
  validateCreateBody,
  validateUpdateBody,
  checkProductOwner,
} from './product.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import { nestedProductCommentRouter } from '../productComments/index.js';
import { nestedProductLikeRouter } from '../productLikes/index.js';

const productRouter = Router();

// 모든 상품 조회
productRouter.get('/', optionalAuthenticate, validateGetQuery, asyncHandler(productController.getProducts));

// --- 여기부터 로그인 필요 ---
productRouter.use(authenticate);

// 상품 생성
productRouter.post('/', validateCreateBody, asyncHandler(productController.createProduct));

// 특정 상품 조회, 수정, 삭제 (/:id)
productRouter
  .route('/:id')
  .get(validateId, asyncHandler(productController.getProductById))
  .put(validateId, validateUpdateBody, checkProductOwner, asyncHandler(productController.updateProduct))
  .delete(validateId, checkProductOwner, asyncHandler(productController.deleteProduct));

productRouter.use('/:productId/comments', nestedProductCommentRouter);
productRouter.use('/:productId/likes', nestedProductLikeRouter);

export { productRouter };
