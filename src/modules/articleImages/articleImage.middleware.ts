import { cloudinaryUploader } from '../../middlewares/cloudinary.upload.middleware.js';
import type { UploadApiOptions } from 'cloudinary';

// ------------
// |  UPLOAD  |
// ------------

// 게시글 사진 생성 (업로드)
const articleOption: UploadApiOptions = {
  resource_type: 'image',
  folder: 'articles',
  type: 'upload',
};

export const articleImageUpload = cloudinaryUploader(articleOption);
