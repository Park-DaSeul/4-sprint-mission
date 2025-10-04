import { Router } from 'express';
import { articleLikeController } from './articleLike.container.js';
import { validateArticleId } from './articleLike.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const nestedArticleLikeRouter = Router({ mergeParams: true });

// --- 여기부터 로그인 필요 ---
nestedArticleLikeRouter.use(authenticate);

// 게시글 좋아요 생성 (토글)
nestedArticleLikeRouter.post('/', validateArticleId, asyncHandler(articleLikeController.createArticleLike));

export { nestedArticleLikeRouter };
