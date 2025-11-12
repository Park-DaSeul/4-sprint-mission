import type { Prisma, PrismaClient } from '@prisma/client';

export class ArticleRepository {
  constructor(private prisma: PrismaClient) {}

  // 모든 게시글 조회
  public getArticles = async (getQuery: Prisma.ArticleFindManyArgs, likesQuery: Prisma.ArticleInclude) => {
    const articles = await this.prisma.article.findMany({
      ...getQuery,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        articleComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        articleImages: {
          select: {
            fileUrl: true,
          },
        },
        ...likesQuery,
      },
    });

    return articles;
  };

  // 특정 게시글 조회
  public getArticleById = async (id: string, userId: string) => {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        articleComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        articleImages: {
          select: {
            fileUrl: true,
          },
        },
        articleLikes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return article;
  };

  // 게시글 생성
  public createArticle = async (createData: Prisma.ArticleCreateInput) => {
    const article = await this.prisma.article.create({
      data: createData,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        articleImages: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    return article;
  };

  // 게시글 수정
  public updateArticle = async (id: string, updateData: Prisma.ArticleUpdateInput) => {
    const article = await this.prisma.article.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        articleComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        articleImages: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    return article;
  };

  // 게시글 삭제
  public deleteArticle = async (id: string) => {
    return await this.prisma.article.delete({
      where: { id },
    });
  };
}
