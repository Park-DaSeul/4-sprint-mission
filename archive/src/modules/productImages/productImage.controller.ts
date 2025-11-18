import { ProductImageService } from './productImage.service.js';
import type { Response } from 'express';
import type { CreateProductImageRequest } from './productImage.dto.js';
import { deleteImageFromCloudinary } from '../../lib/cloudinary-service.js';

export class ProductImageController {
  constructor(private productImageService: ProductImageService) {}

  // 상품 사진 생성 (업로드)
  public createProductImage = async (req: CreateProductImageRequest, res: Response) => {
    const publicId = req.cloudinaryResult.public_id;
    const fileUrl = req.cloudinaryResult.secure_url;

    const data = { publicId, fileUrl };

    try {
      const productImage = await this.productImageService.createProductImage(data);
      return res.status(201).json(productImage);

      // DB 저장 실패 시 롤백 (Cloudinary 파일 삭제)
    } catch (dbError) {
      console.error('DB 저장 실패! Cloudinary 롤백을 시작합니다.', dbError);
      await deleteImageFromCloudinary(publicId);

      return res.status(500).json({ message: '사진 정보를 저장하는 데 실패했습니다.' });
    }
  };
}
