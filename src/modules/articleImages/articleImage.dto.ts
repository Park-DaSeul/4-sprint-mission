import type { AuthenticatedRequest } from '../../types/request.type.js';

// ----------
// |  TYPE  |
// ----------

// 게시글 사진 생성 (업로드)
export interface CreateArticleImageRequest extends AuthenticatedRequest {
  cloudinaryResult: {
    public_id: string;
    secure_url: string;
  };
}

export interface CreateArticleImageBody {
  publicId: string;
  fileUrl: string;
}
