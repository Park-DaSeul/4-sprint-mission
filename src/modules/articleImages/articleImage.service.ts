import { ArticleImageRepository } from './articleImage.repository.js';
import type { Prisma } from '@prisma/client';
import type { CreateArticleImageBody } from './articleImage.dto.js';

export class ArticleImageService {
  constructor(private articleImageRepository: ArticleImageRepository) {}

  // 게시글 사진 생성 (업로드)
  public createArticleImage = async (data: CreateArticleImageBody) => {
    const { publicId, fileUrl } = data;

    const createData: Prisma.ArticleImageCreateInput = {
      publicId,
      fileUrl,
    };

    const articleImage = await this.articleImageRepository.createArticleImage(createData);

    return articleImage;
  };
}
