import { ProductImageRepository } from './productImage.repository.js';
import type { Prisma } from '@prisma/client';
import type { CreateProductImageBody } from './productImage.dto.js';

export class ProductImageService {
  constructor(private productImageRepository: ProductImageRepository) {}

  // 상품 사진 생성 (업로드)
  public createProductImage = async (data: CreateProductImageBody) => {
    const { publicId, fileUrl } = data;

    const createData: Prisma.ProductImageCreateInput = {
      publicId,
      fileUrl,
    };

    const productImage = await this.productImageRepository.createProductImage(createData);

    return productImage;
  };
}
