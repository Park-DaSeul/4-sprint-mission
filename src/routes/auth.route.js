import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authValidation from '../validations/auth.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';

const authRouter = express.Router();

// 회원가입
authRouter.post('/signup', validate(authValidation.signup), asyncHandler(authController.signup));

// 로그인
authRouter.post(
  '/login',
  passport.authenticate('local', { session: false }),
  validate(authValidation.login),
  asyncHandler(authController.login),
);

// 토큰 재발급
authRouter.post(
  '/refresh',
  passport.authenticate('refresh-token', { session: false }),
  validate(authValidation.refresh),
  asyncHandler(authController.refresh),
);

// 로그아웃
authRouter.post('/logout', asyncHandler(authController.logout));

export { authRouter };
