import { Router } from 'express';
import { articleController } from './article.container.js';
import {
  validateId,
  validateGetQuery,
  validateCreateBody,
  validateUpdateBody,
  checkArticleOwner,
} from './article.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import { nestedArticleCommentRouter } from '../articleComments/index.js';
import { nestedArticleLikeRouter } from '../articleLikes/index.js';

const articleRouter = Router();

// 모든 게시글 조회
articleRouter.get('/', optionalAuthenticate, validateGetQuery, asyncHandler(articleController.getArticles));

// --- 여기부터 로그인 필요 ---
articleRouter.use(authenticate);

// 게시글 생성
articleRouter.post('/', validateCreateBody, asyncHandler(articleController.createArticle));

// 특정 게시글 조회, 수정, 삭제 (/:id)
articleRouter
  .route('/:id')
  .get(validateId, asyncHandler(articleController.getArticleById))
  .put(validateId, validateUpdateBody, checkArticleOwner, asyncHandler(articleController.updateArticle))
  .delete(validateId, checkArticleOwner, asyncHandler(articleController.deleteArticle));

articleRouter.use('/:articleId/comments', nestedArticleCommentRouter);
articleRouter.use('/:articleId/likes', nestedArticleLikeRouter);

export { articleRouter };
