import { Router } from 'express';
import { userController } from './user.container.js';
import { validateUpdateBody, validateDeleteBody } from './user.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const userRouter = Router();

// --- 여기부터 로그인 필요 ---
userRouter.use(authenticate);

// 사용자 조회, 수정, 삭제
userRouter
  .route('/me')
  .get(asyncHandler(userController.getUser))
  .put(validateUpdateBody, asyncHandler(userController.updateUser))
  .delete(validateDeleteBody, asyncHandler(userController.deleteUser));

// 사용자가 등록한 상품 조회
userRouter.get('/me/products', asyncHandler(userController.getUserProduct));

// 사용자가 좋아요 누른 상품 조회
userRouter.get('/me/likes', asyncHandler(userController.getUserLike));

export { userRouter };
