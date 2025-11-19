import { ArticleRepository } from './article.repository.js';
import type { Prisma, Article } from '@prisma/client';
import type { CreateArticleBody, UpdateArticleBody } from './article.dto.js';
import type { OffsetQuery } from '../../common/index.js';
import { NotFoundError, BadRequestError } from '../../utils/errorClass.js';

export class ArticleService {
  constructor(private articleRepository: ArticleRepository) {}

  // 모든 게시글 조회
  public getArticles = async (query: OffsetQuery, userId: string | null) => {
    const { limit: take = 10, offset: skip = 0, order = 'recent', search } = query;

    // 페이지 네이션 offset 방식
    let orderBy: Prisma.ArticleOrderByWithRelationInput;
    switch (order) {
      case 'old':
        orderBy = { createdAt: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // where 조건 추가
    let where: Prisma.ArticleWhereInput = {};
    if (search) {
      where = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // userId가 유효할 때만 필터를 적용하는 객체 생성
    const likesQuery: Prisma.ArticleInclude = userId
      ? {
          articleLikes: {
            where: { userId },
            select: {
              id: true,
            },
          },
        }
      : {};

    // query 구성 (페이지 네이션, 정렬 포함)
    const getQuery: Prisma.ArticleFindManyArgs = {
      where,
      orderBy,
      skip,
      take,
    };

    const articles = await this.articleRepository.getArticles(getQuery, likesQuery);

    // 데이터 가공
    // isLiked로 좋아요를 불리언 값으로 변환
    const articlesData = articles.map(({ articleLikes, ...rest }) => ({
      ...rest,
      isLiked: articleLikes?.length > 0,
    }));

    return articlesData;
  };

  // 특정 게시글 조회
  public getArticleById = async (id: string, userId: string) => {
    const article = await this.articleRepository.getArticleById(id, userId);
    if (!article) throw new NotFoundError('게시글을 찾을 수 없습니다.');

    // 데이터 가공
    // isLiked로 좋아요를 불리언 값으로 변환
    const { articleLikes, ...rest } = article;
    const articleData = {
      ...rest,
      isLiked: article.articleLikes.length > 0,
    };

    return articleData;
  };

  // 게시글 생성
  public createArticle = async (userId: string, data: CreateArticleBody) => {
    const { title, content, imageIds } = data;

    const createData: Prisma.ArticleCreateInput = {
      title,
      content,
      user: {
        connect: { id: userId },
      },
      ...(imageIds && {
        articleImages: {
          connect: imageIds,
        },
      }),
    };

    const article = await this.articleRepository.createArticle(createData);

    return article;
  };

  // 게시글 수정
  public updateArticle = async (id: string, data: UpdateArticleBody, resource: Article) => {
    const { title, content, imageIds } = data;

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.ArticleUpdateInput = {
      ...(title !== resource.title && { title }),
      ...(content !== resource.content && { content }),
      ...(imageIds && {
        articleImages: {
          set: imageIds,
        },
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('수정할 내용이 없습니다.');
    }

    const article = await this.articleRepository.updateArticle(id, updateData);

    return article;
  };

  // 게시글 삭제
  public deleteArticle = async (id: string) => {
    return await this.articleRepository.deleteArticle(id);
  };
}
