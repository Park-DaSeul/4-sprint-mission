import express from 'express';
import * as articleController from './articles.controller.js';
import * as articleDto from './articles.dto.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import passport from '../../libs/passport/index.js';
import { nestedCommentRouter } from '../comments/comments.route.js';
import { nestedArticleLikeRouter } from '../articleLikes/articleLikes.route.js';
import { optionalAuthenticate } from '../../middlewares/optionalAuth.middleware.js';
import { articleImageUpload } from '../../middlewares/upload.middleware.js';
import { jsonBodyParser } from '../../middlewares/jsonBodyParser.middleware.js';

const articleRouter = express.Router();

// 모든 게시글 조회
articleRouter.get(
  '/',
  optionalAuthenticate,
  validate(articleDto.getArticles),
  asyncHandler(articleController.getArticles),
);

// --- 여기부터 로그인 필요 ---
articleRouter.use(passport.authenticate('access-token', { session: false }));

// 게시글 생성
articleRouter.post(
  '/',
  articleImageUpload,
  jsonBodyParser,
  validate(articleDto.createArticle),
  asyncHandler(articleController.createArticle),
);

// 특정 게시글 조회, 수정, 삭제 (/:id)
articleRouter
  .route('/:id')
  .get(validate(articleDto.getArticleById), asyncHandler(articleController.getArticleById))
  .put(validate(articleDto.updateArticle), asyncHandler(articleController.updateArticle))
  .delete(validate(articleDto.deleteArticle), asyncHandler(articleController.deleteArticle));

// 게시글 이미지 수정, 삭제
articleRouter
  .route('/:id/image')
  .put(articleImageUpload, validate(articleDto.updateArticleImage), asyncHandler(articleController.updateArticleImage))
  .delete(
    articleImageUpload,
    validate(articleDto.deleteArticleImage),
    asyncHandler(articleController.deleteArticleImage),
  );

articleRouter.use('/:articleId/comments', nestedCommentRouter);
articleRouter.use('/:articleId/articleLikes', nestedArticleLikeRouter);

export { articleRouter };
