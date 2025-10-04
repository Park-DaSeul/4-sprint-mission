import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import type { ProductIdParams } from '../../common/index.js';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 상품 좋아요 생성 (토글)
export interface createProductLikeRequest extends AuthenticatedRequest {
  parsedParams: ProductIdParams;
}
