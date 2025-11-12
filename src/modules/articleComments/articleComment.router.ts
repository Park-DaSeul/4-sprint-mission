import { Router } from 'express';
import { articleCommentController } from './articleComment.container.js';
import {
  validateId,
  validateArticleId,
  validateGetQuery,
  validateCreateBody,
  validateUpdateBody,
  checkArticleExists,
  checkArticleCommentOwner,
} from './articleComment.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const nestedArticleCommentRouter = Router({ mergeParams: true });
const articleCommentRouter = Router();

// --- 여기부터 로그인 필요 ---
articleCommentRouter.use(authenticate);
nestedArticleCommentRouter.use(authenticate);

// 게시글 모든 댓글 조회, 댓글 생성
nestedArticleCommentRouter
  .route('/')
  .get(validateArticleId, validateGetQuery, asyncHandler(articleCommentController.getArticleComments))
  .post(
    validateArticleId,
    validateCreateBody,
    checkArticleExists,
    asyncHandler(articleCommentController.createArticleComment),
  );

// 게시글 특정 댓글 조회, 수정, 삭제 (/:id)
articleCommentRouter
  .route('/:id')
  .get(validateId, asyncHandler(articleCommentController.getArticleCommentById))
  .put(
    validateId,
    validateUpdateBody,
    checkArticleCommentOwner,
    asyncHandler(articleCommentController.updateArticleComment),
  )
  .delete(validateId, checkArticleCommentOwner, asyncHandler(articleCommentController.deleteArticleComment));

export { articleCommentRouter, nestedArticleCommentRouter };
