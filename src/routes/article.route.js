import express from 'express';
import * as articleController from '../controllers/article.controller.js';
import * as articleValidation from '../validations/article.validation.js';
//import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { commentRouter } from './comment.route.js';

import { uploadArticleImage } from '../../utils/uploads/articleUpload.js';

const articleRouter = express.Router();

// 모든 게시글 조회
articleRouter
  .route('/')
  .get(validate(articleValidation.getArticles), asyncHandler(articleController.getArticles))
  .post(
    uploadArticleImage.single('image'),
    (validate(articleValidation.createArticle), asyncHandler(articleController.createArticle)),
  );

// 특정 게시글 조회, 수정, 삭제 (/:id)
articleRouter
  .route('/:id')
  .get(validate(articleValidation.getArticleById), asyncHandler(articleController.getArticleById))
  .put(validate(articleValidation.updateArticle), asyncHandler(articleController.updateArticle))
  .delete(validate(articleValidation.deleteArticle), asyncHandler(articleController.deleteArticle));

articleRouter.use('/:articleId/comments', commentRouter);

export { articleRouter };
