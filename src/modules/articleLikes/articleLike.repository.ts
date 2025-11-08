import type { Prisma, PrismaClient } from '@prisma/client';

export class ArticleLikeRepository {
  constructor(private prisma: PrismaClient) {}

  // 게시글 좋아요 생성
  public createArticleLike = async (createData: Prisma.ArticleLikeCreateInput) => {
    const articleLike = await this.prisma.articleLike.create({
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
        article: {
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

    return articleLike;
  };

  // 게시글 좋아요 삭제
  public deleteArticleLike = async (articleId: string, userId: string) => {
    const deleteCount = await this.prisma.articleLike.deleteMany({
      where: {
        articleId,
        userId,
      },
    });

    return deleteCount;
  };

  // 특정 게시글 좋아요 조회
  // public getArticleLikeById = async (articleId: string, userId: string) => {
  //   const articleLike = await this.prisma.articleLike.findUnique({
  //     where: {
  //       userId_articleId: {
  //         articleId,
  //         userId,
  //       },
  //     },
  //   });

  //   return articleLike;
  // };
}
