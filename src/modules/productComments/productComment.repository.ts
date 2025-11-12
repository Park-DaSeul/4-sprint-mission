import type { Prisma, PrismaClient } from '@prisma/client';

export class ProductCommentRepository {
  constructor(private prisma: PrismaClient) {}

  // 상품 모든 댓글 조회
  public getProductComments = async (getQuery: Prisma.ProductCommentFindManyArgs) => {
    const productComments = await this.prisma.productComment.findMany({
      ...getQuery,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return productComments;
  };

  // 상품 특정 댓글 조회
  public getProductCommentById = async (id: string) => {
    const productComment = await this.prisma.productComment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return productComment;
  };

  // 상품 댓글 생성
  public createProductComment = async (createData: Prisma.ProductCommentCreateInput) => {
    const productComment = await this.prisma.productComment.create({
      data: createData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
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

    return productComment;
  };

  // 상품 댓글 수정
  public updateProductComment = async (id: string, updateData: Prisma.ProductCommentUpdateInput) => {
    const productComment = await this.prisma.productComment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return productComment;
  };

  // 상품 댓글 삭제
  public deleteProductComment = async (id: string) => {
    return await this.prisma.productComment.delete({
      where: { id },
    });
  };
}
