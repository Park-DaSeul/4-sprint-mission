import { cloudinaryUploader } from '../../middlewares/cloudinary.upload.middleware.js';
import type { UploadApiOptions } from 'cloudinary';

// ------------
// |  UPLOAD  |
// ------------

// 사용자 사진 생성 (업로드)
const userOption: UploadApiOptions = {
  resource_type: 'image',
  folder: 'users',
  type: 'upload',
};

export const userImageUpload = cloudinaryUploader(userOption);
