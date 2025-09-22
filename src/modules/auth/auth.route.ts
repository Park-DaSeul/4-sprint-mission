import express from 'express';
import * as authController from './auth.controller.js';
import * as authDto from './auth.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';

const authRouter = express.Router();

// 회원가입
authRouter.post('/signup', validate(authDto.signup), asyncHandler(authController.signup));

// 로그인
authRouter.post(
  '/login',
  passport.authenticate('local', { session: false }),
  validate(authDto.login),
  asyncHandler(authController.login),
);

// 토큰 재발급
authRouter.post(
  '/refresh',
  passport.authenticate('refresh-token', { session: false }),
  validate(authDto.refresh),
  asyncHandler(authController.refresh),
);

// 로그아웃
authRouter.post('/logout', asyncHandler(authController.logout));

export { authRouter };
