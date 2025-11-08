import type { AuthenticatedRequest } from '../../types/request.type.js';

// ----------
// |  TYPE  |
// ----------

// 사용자 사진 생성 (업로드)
export interface CreateUserImageRequest extends AuthenticatedRequest {
  cloudinaryResult: {
    public_id: string;
    secure_url: string;
  };
}

export interface CreateUserImageBody {
  publicId: string;
  fileUrl: string;
}
