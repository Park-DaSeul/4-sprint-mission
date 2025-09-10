import express from 'express';
import * as articleLikeController from '../controllers/articleLike.controller.js';
import * as articleLikeValidation from '../validations/articleLike.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';

const articleLikeRouter = express.Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
articleLikeRouter.use(passport.authenticate('access-token', { session: false }));

// 게시글 좋아요 생성 (토글)
articleLikeRouter.post(
  '/',
  (validate(articleLikeValidation.createArticleLike), asyncHandler(articleLikeController.createArticleLike)),
);

export { articleLikeRouter };
