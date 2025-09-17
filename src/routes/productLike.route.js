import express from 'express';
import * as productLikeController from '../controllers/productLike.controller.js';
import * as productLikeValidation from '../validations/productLike.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';

const productLikeRouter = express.Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
productLikeRouter.use(passport.authenticate('access-token', { session: false }));

// 상품 좋아요 생성 (토글)
productLikeRouter.post(
  '/',
  (validate(productLikeValidation.createProductLike), asyncHandler(productLikeController.createProductLike)),
);

export { productLikeRouter };
