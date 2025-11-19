import type { AuthenticatedRequest } from '../../types/request.type.js';
import type { ProductIdParams } from '../../common/index.js';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 상품 좋아요 생성 (토글)
export interface createProductLikeRequest extends AuthenticatedRequest {
  parsedParams: ProductIdParams;
}
