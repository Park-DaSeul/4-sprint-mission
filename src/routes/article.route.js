import express from 'express';
import * as articleController from '../controllers/article.controller.js';
import * as articleValidation from '../validations/article.validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../libs/passport/index.js';
import { commentRouter } from './comment.route.js';
import { articleLikeRouter } from './articleLike.route.js';
import { optionalAuthenticate } from '../middlewares/optionalAuth.middleware.js';

//import { uploadArticleImage } from '../../utils/uploads/articleUpload.js';
//uploadArticleImage.single('image'),

const articleRouter = express.Router();

// 모든 게시글 조회
articleRouter.get(
  '/',
  optionalAuthenticate,
  validate(articleValidation.getArticles),
  asyncHandler(articleController.getArticles),
);

// --- 여기부터 로그인 필요 ---
articleRouter.use(passport.authenticate('access-token', { session: false }));

// 게시글 생성
articleRouter.post('/', (validate(articleValidation.createArticle), asyncHandler(articleController.createArticle)));

// 특정 게시글 조회, 수정, 삭제 (/:id)
articleRouter
  .route('/:id')
  .get(validate(articleValidation.getArticleById), asyncHandler(articleController.getArticleById))
  .put(validate(articleValidation.updateArticle), asyncHandler(articleController.updateArticle))
  .delete(validate(articleValidation.deleteArticle), asyncHandler(articleController.deleteArticle));

articleRouter.use('/:articleId/comments', commentRouter);
articleRouter.use('/:articleId/articleLikes', articleLikeRouter);

export { articleRouter };
