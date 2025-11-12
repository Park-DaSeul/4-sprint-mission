import type { Prisma, PrismaClient } from '@prisma/client';

export class ArticleCommentRepository {
  constructor(private prisma: PrismaClient) {}

  // 게시글 모든 댓글 조회
  public getArticleComments = async (getQuery: Prisma.ArticleCommentFindManyArgs) => {
    const articleComments = await this.prisma.articleComment.findMany({
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

    return articleComments;
  };

  // 게시글 특정 댓글 조회
  public getArticleCommentById = async (id: string) => {
    const articleComment = await this.prisma.articleComment.findUnique({
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

    return articleComment;
  };

  // 게시글 댓글 생성
  public createArticleComment = async (createData: Prisma.ArticleCommentCreateInput) => {
    const articleComment = await this.prisma.articleComment.create({
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

    return articleComment;
  };

  // 게시글 댓글 수정
  public updateArticleComment = async (id: string, updateData: Prisma.ArticleCommentUpdateInput) => {
    const articleComment = await this.prisma.articleComment.update({
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

    return articleComment;
  };

  // 게시글 댓글 삭제
  public deleteArticleComment = async (id: string) => {
    return await this.prisma.articleComment.delete({
      where: { id },
    });
  };
}
