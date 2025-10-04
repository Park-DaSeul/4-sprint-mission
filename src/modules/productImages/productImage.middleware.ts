import { cloudinaryUploader } from '../../middlewares/cloudinary.upload.middleware.js';
import type { UploadApiOptions } from 'cloudinary';

// ------------
// |  UPLOAD  |
// ------------

// 상품 사진 생성 (업로드)
const productOption: UploadApiOptions = {
  resource_type: 'image',
  folder: 'products',
  type: 'upload',
};

export const productImageUpload = cloudinaryUploader(productOption);
