import { Router } from 'express';
import { authController } from './auth.container.js';
import { validateSignupBody, validateloginBody, validateRefreshBody } from './auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { localAuthenticate, refreshTokenAuthenticate, authenticate } from '../../middlewares/auth.middleware.js';

const authRouter = Router();

// 회원가입
authRouter.post('/signup', validateSignupBody, asyncHandler(authController.signup));

// 로그인
authRouter.post('/login', localAuthenticate, validateloginBody, asyncHandler(authController.login));

// 토큰 재발급
authRouter.post('/refresh', refreshTokenAuthenticate, validateRefreshBody, asyncHandler(authController.refresh));

// 로그아웃
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));

export { authRouter };
