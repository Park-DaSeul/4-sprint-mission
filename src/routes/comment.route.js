import express from 'express';
import * as commentController from '../controllers/comment.controller.js';
import * as commentValidation from '../validations/comment.validation.js';
//import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import { uploadCommentImage } from '../../utils/uploads/commentUpload.js';

const commentRouter = express.Router();

// 모든 댓글 조회
commentRouter
  .route('/')
  .get(validate(commentValidation.getComments), asyncHandler(commentController.getComments))
  .post(
    uploadCommentImage.single('image'),
    (validate(commentValidation.createComment), asyncHandler(commentController.createComment)),
  );

// 특정 댓글 조회, 수정, 삭제 (/:id)
commentRouter
  .route('/:id')
  .get(validate(commentValidation.getCommentById), asyncHandler(commentController.getCommentById))
  .put(validate(commentValidation.updateComment), asyncHandler(commentController.updateComment))
  .delete(validate(commentValidation.deleteComment), asyncHandler(commentController.deleteComment));

export { commentRouter };
