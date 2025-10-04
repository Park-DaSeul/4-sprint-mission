import type { Prisma, PrismaClient } from '@prisma/client';

export class ArticleImageRepository {
  constructor(private prisma: PrismaClient) {}

  // 게시글 사진 생성 (업로드)
  public createArticleImage = async (createData: Prisma.ArticleImageCreateInput) => {
    const image = await this.prisma.articleImage.create({
      data: createData,
      select: { id: true },
    });

    return image;
  };
}
