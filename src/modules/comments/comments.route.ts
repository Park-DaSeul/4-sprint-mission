import express from 'express';
import * as commentController from './comments.controller.js';
import * as commentDto from './comments.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';
import { resourceIdentifier } from '../../middlewares/resourceIdentifier.middleware.js';

const nestedCommentRouter = express.Router({ mergeParams: true });
const commentRouter = express.Router();

// --- 여기부터 로그인 필요 ---
commentRouter.use(passport.authenticate('access-token', { session: false }));

// 모든 댓글 조회, 댓글 생성
nestedCommentRouter
  .route('/')
  .get(resourceIdentifier, validate(commentDto.getComments), asyncHandler(commentController.getComments))
  .post(resourceIdentifier, validate(commentDto.createComment), asyncHandler(commentController.createComment));

// 특정 댓글 조회, 수정, 삭제 (/:id)
commentRouter
  .route('/:id')
  .get(validate(commentDto.getCommentById), asyncHandler(commentController.getCommentById))
  .put(validate(commentDto.updateComment), asyncHandler(commentController.updateComment))
  .delete(validate(commentDto.deleteComment), asyncHandler(commentController.deleteComment));

export { commentRouter, nestedCommentRouter };
