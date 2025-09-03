import express from 'express';
import * as productController from '../controllers/product.controller.js';
import * as productValidation from '../validations/product.validation.js';
//import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { commentRouter } from './comment.route.js';

import { uploadProductImage } from '../../utils/uploads/productUpload.js';

const productRouter = express.Router();

// 모든 게시글 조회
productRouter
  .route('/')
  .get(validate(productValidation.getProducts), asyncHandler(productController.getProducts))
  .post(
    uploadProductImage.single('image'),
    (validate(productValidation.createProduct), asyncHandler(productController.createProduct)),
  );

// 특정 게시글 조회, 수정, 삭제 (/:id)
productRouter
  .route('/:id')
  .get(validate(productValidation.getProductById), asyncHandler(productController.getProductById))
  .put(validate(productValidation.updateProduct), asyncHandler(productController.updateProduct))
  .delete(validate(productValidation.deleteProduct), asyncHandler(productController.deleteProduct));

productRouter.use('/:productId/comments', commentRouter);

export { productRouter };
