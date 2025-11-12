import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

// ----------
// |  TYPE  |
// ----------

// 상품 사진 업로드
export interface CreateProductImageRequest extends AuthenticatedRequest {
  cloudinaryResult: {
    public_id: string;
    secure_url: string;
  };
}

export interface CreateProductImageBody {
  publicId: string;
  fileUrl: string;
}
