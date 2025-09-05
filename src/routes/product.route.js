import express from 'express';
import * as productController from '../controllers/product.controller.js';
import * as productValidation from '../validations/product.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';
import { commentRouter } from './comment.route.js';
import { productLikeRouter } from './productLike.route.js';
import { optionalAuthenticate } from '../middlewares/optionalAuth.middleware.js';

//import { uploadProductImage } from '../../utils/uploads/productUpload.js';

const productRouter = express.Router();

// 모든 상품 조회
productRouter.get(
  '/',
  optionalAuthenticate,
  validate(productValidation.getProducts),
  asyncHandler(productController.getProducts),
);

// --- 여기부터 로그인 필요 ---
productRouter.use(passport.authenticate('access-token', { session: false }));

// 상품 생성
productRouter.post('/', (validate(productValidation.createProduct), asyncHandler(productController.createProduct)));

// 특정 상품 조회, 수정, 삭제 (/:id)
productRouter
  .route('/:id')
  .get(validate(productValidation.getProductById), asyncHandler(productController.getProductById))
  .put(validate(productValidation.updateProduct), asyncHandler(productController.updateProduct))
  .delete(validate(productValidation.deleteProduct), asyncHandler(productController.deleteProduct));

productRouter.use('/:productId/comments', commentRouter);
productRouter.use('/:productId/productLikes', productLikeRouter);

export { productRouter };
