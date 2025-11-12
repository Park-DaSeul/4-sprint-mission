import { Router } from 'express';
import { productCommentController } from './productComment.container.js';
import {
  validateId,
  validateProductId,
  validateGetQuery,
  validateCreateBody,
  validateUpdateBody,
  checkProductExists,
  checkProductCommentOwner,
} from './productComment.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const nestedProductCommentRouter = Router({ mergeParams: true });
const productCommentRouter = Router();

// --- 여기부터 로그인 필요 ---
productCommentRouter.use(authenticate);
nestedProductCommentRouter.use(authenticate);

// 상품 모든 댓글 조회, 댓글 생성
nestedProductCommentRouter
  .route('/')
  .get(validateProductId, validateGetQuery, asyncHandler(productCommentController.getProductComments))
  .post(
    validateProductId,
    validateCreateBody,
    checkProductExists,
    asyncHandler(productCommentController.createProductComment),
  );

// 상품 특정 댓글 조회, 수정, 삭제 (/:id)
productCommentRouter
  .route('/:id')
  .get(validateId, asyncHandler(productCommentController.getProductCommentById))
  .put(
    validateId,
    validateUpdateBody,
    checkProductCommentOwner,
    asyncHandler(productCommentController.updateProductComment),
  )
  .delete(validateId, checkProductCommentOwner, asyncHandler(productCommentController.deleteProductComment));

export { productCommentRouter, nestedProductCommentRouter };
