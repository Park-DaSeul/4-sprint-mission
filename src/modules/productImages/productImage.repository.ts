import type { Prisma, PrismaClient } from '@prisma/client';

export class ProductImageRepository {
  constructor(private prisma: PrismaClient) {}

  // 상품 사진 생성 (업로드)
  public createProductImage = async (createData: Prisma.ProductImageCreateInput) => {
    const productImage = await this.prisma.productImage.create({
      data: createData,
      select: {
        id: true,
      },
    });

    return productImage;
  };
}
