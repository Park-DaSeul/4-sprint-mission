import type { Prisma, PrismaClient } from '@prisma/client';

export class ProductLikeRepository {
  constructor(private prisma: PrismaClient) {}

  // 상품 좋아요 생성
  public createProductLike = async (createData: Prisma.ProductLikeCreateInput) => {
    const productLike = await this.prisma.productLike.create({
      data: createData,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
          },
        },
        product: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return productLike;
  };

  // 상품 좋아요 삭제
  public deleteProductLike = async (productId: string, userId: string) => {
    const deleteCount = await this.prisma.productLike.deleteMany({
      where: {
        productId,
        userId,
      },
    });

    return deleteCount;
  };

  // 특정 상품 좋아요 조회
  // public getProductLikeById = async (productId: string, userId: string) => {
  //   const productLike = await this.prisma.productLike.findUnique({
  //     where: {
  //       userId_productId: {
  //         productId,
  //         userId,
  //       },
  //     },
  //   });

  //   return productLike;
  // };
}
