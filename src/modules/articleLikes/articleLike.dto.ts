import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import type { ArticleIdParams } from '../../common/index.js';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 게시글 좋아요 생성 (토글)
export interface createArticleLikeRequest extends AuthenticatedRequest {
  parsedParams: ArticleIdParams;
}
