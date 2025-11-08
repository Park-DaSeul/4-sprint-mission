import type { Prisma, PrismaClient } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  // 사용자 조회
  public getUser = async (id: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        userImage: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    return user;
  };

  // 사용자 수정
  public updateUser = async (id: string, updateData: Prisma.UserUpdateInput) => {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        userImage: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    return user;
  };

  // 사용자 삭제
  public deleteUser = async (id: string) => {
    return await this.prisma.user.delete({
      where: { id },
    });
  };

  // 사용자가 등록한 상품 목록 조회
  public getUserProduct = async (id: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
            productImages: {
              select: {
                fileUrl: true,
              },
            },
          },
        },
      },
    });

    return user;
  };

  // 사용자가 좋아요 누른 상품 목록 조회
  public getUserLike = async (id: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        productLikes: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                productImages: {
                  select: {
                    fileUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return user;
  };
}
