import express from 'express';
import * as articleLikeController from './articleLikes.controller.js';
import * as articleLikeDto from './articleLikes.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';

const nestedArticleLikeRouter = express.Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
nestedArticleLikeRouter.use(passport.authenticate('access-token', { session: false }));

// 게시글 좋아요 생성 (토글)
nestedArticleLikeRouter.post(
  '/',
  (validate(articleLikeDto.createArticleLike), asyncHandler(articleLikeController.createArticleLike)),
);

export { nestedArticleLikeRouter };
