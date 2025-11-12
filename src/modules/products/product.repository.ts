import type { Prisma, PrismaClient } from '@prisma/client';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  // 모든 상품 조회
  public getProducts = async (getQuery: Prisma.ProductFindManyArgs, likesQuery: Prisma.ProductInclude) => {
    const products = await this.prisma.product.findMany({
      ...getQuery,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        productComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        productImages: {
          select: {
            fileUrl: true,
          },
        },
        ...likesQuery,
      },
    });

    return products;
  };

  // 특정 상품 조회
  public getProductById = async (id: string, userId: string) => {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        productComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        productImages: {
          select: {
            fileUrl: true,
          },
        },
        productLikes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return product;
  };

  // 상품 생성
  public createProduct = async (createData: Prisma.ProductCreateInput) => {
    const product = await this.prisma.product.create({
      data: createData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        productImages: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    return product;
  };

  // 상품 수정
  public updateProduct = async (id: string, updateData: Prisma.ProductUpdateInput) => {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        productComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        productImages: {
          select: {
            fileUrl: true,
          },
        },
        productLikes: {
          select: {
            userId: true,
          },
        },
      },
    });

    return product;
  };

  // 상품 삭제
  public deleteProduct = async (id: string) => {
    return await this.prisma.product.delete({
      where: { id },
    });
  };
}
