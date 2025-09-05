import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as userValidation from '../validations/user.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';

const userRouter = express.Router();

// --- 여기부터 로그인 필요 ---
userRouter.use(passport.authenticate('access-token', { session: false }));

// 사용자 조회
userRouter.get('/me', asyncHandler(userController.getUser));

// 사용자 수정, 삭제
userRouter
  .route('/me')
  .put(validate(userValidation.updateUser), asyncHandler(userController.updateUser))
  .delete(validate(userValidation.deleteUser), asyncHandler(userController.deleteUser));

// 사용자가 등록한 상품 목록 조회
userRouter.get('/me/products', asyncHandler(userController.getUserProducts));

// 사용자가 좋아요 누른 상품 목록조회
userRouter.get('/me/likess', asyncHandler(userController.getUserLikedProducts));

export { userRouter };
