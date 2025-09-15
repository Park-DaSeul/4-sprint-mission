import express from 'express';
import * as productLikeController from './productLikes.controller.js';
import * as productLikeDto from './productLikes.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';

const nestedProductLikeRouter = express.Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
nestedProductLikeRouter.use(passport.authenticate('access-token', { session: false }));

// 상품 좋아요 생성 (토글)
nestedProductLikeRouter.post(
  '/',
  (validate(productLikeDto.createProductLike), asyncHandler(productLikeController.createProductLike)),
);

export { nestedProductLikeRouter };
