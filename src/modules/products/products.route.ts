import express from 'express';
import * as productController from './products.controller.js';
import * as productDto from './products.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';
import { nestedCommentRouter } from '../comments/comments.route.js';
import { nestedProductLikeRouter } from '../productLikes/productLikes.route.js';
import { optionalAuthenticate } from '../../middlewares/optionalAuth.middleware.js';

const productRouter = express.Router();

// 모든 상품 조회
productRouter.get(
  '/',
  optionalAuthenticate,
  validate(productDto.getProducts),
  asyncHandler(productController.getProducts),
);

// --- 여기부터 로그인 필요 ---
productRouter.use(passport.authenticate('access-token', { session: false }));

// 상품 생성
productRouter.post('/', (validate(productDto.createProduct), asyncHandler(productController.createProduct)));

// 특정 상품 조회, 수정, 삭제 (/:id)
productRouter
  .route('/:id')
  .get(validate(productDto.getProductById), asyncHandler(productController.getProductById))
  .put(validate(productDto.updateProduct), asyncHandler(productController.updateProduct))
  .delete(validate(productDto.deleteProduct), asyncHandler(productController.deleteProduct));

productRouter.use('/:productId/comments', nestedCommentRouter);
productRouter.use('/:productId/productLikes', nestedProductLikeRouter);

export { productRouter };
