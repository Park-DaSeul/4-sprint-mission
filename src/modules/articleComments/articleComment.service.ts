import { ArticleCommentRepository } from './articleComment.repository.js';
import type { Prisma } from '@prisma/client';
import type { CreateArticleCommentBody, UpdateArticleCommentBody } from './articleComment.dto.js';
import type { CursorQuery } from '../../common/index.js';
import type { ArticleComment } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service.js';
import type { CreateNotificationBody } from '../notifications/notification.dto.js';

export class ArticleCommentService {
  constructor(
    private articleCommentRepository: ArticleCommentRepository,
    private notificationService: NotificationService,
  ) {}

  // 게시글 모든 댓글 조회
  public getArticleComments = async (query: CursorQuery, articleId: string) => {
    const { limit: take = 10, cursor, search } = query;

    // 페이지 네이션 커서방식
    const searchFilter: Prisma.ArticleCommentWhereInput = search
      ? {
          OR: [{ content: { contains: search, mode: 'insensitive' } }],
        }
      : {};

    // where 조건 추가
    const where: Prisma.ArticleCommentWhereInput = {
      articleId,
      ...searchFilter,
    };

    // query 구성
    const getQuery: Prisma.ArticleCommentFindManyArgs = {
      where,
      take,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    };

    const articleComments = await this.articleCommentRepository.getArticleComments(getQuery);

    const lastArticleCommentInResults = articleComments[articleComments.length - 1];
    const nextCursor = lastArticleCommentInResults ? lastArticleCommentInResults.id : null;

    const articleCommentsData = {
      articleComments,
      nextCursor,
    };

    return articleCommentsData;
  };

  // 게시글 특정 댓글 조회
  public getArticleCommentById = async (id: string) => {
    const articleComment = await this.articleCommentRepository.getArticleCommentById(id);
    if (!articleComment) throw new Error('댓글을 찾을 수 없습니다.');

    return articleComment;
  };

  // 게시글 댓글 생성
  public createArticleComment = async (articleId: string, userId: string, data: CreateArticleCommentBody) => {
    const { content } = data;

    const createData: Prisma.ArticleCommentCreateInput = {
      content,
      article: {
        connect: { id: articleId },
      },
      user: {
        connect: { id: userId },
      },
    };

    const articleComment = await this.articleCommentRepository.createArticleComment(createData);

    // 알림 생성
    if (articleComment.article.user.id !== userId) {
      const notificationData: CreateNotificationBody = {
        recipientId: articleComment.article.user.id,
        senderId: userId,
        entityId: articleComment.article.id,
        type: 'ARTICLE_COMMENT',
        message: '누군가 당신의 게시글에 댓글을 남겼어요.',
      };

      await this.notificationService.createNotification(notificationData);
    }
    return articleComment;
  };

  // 게시글 댓글 수정
  public updateArticleComment = async (id: string, data: UpdateArticleCommentBody, resource: ArticleComment) => {
    const { content } = data;

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.ArticleCommentUpdateInput = {
      ...(content !== resource.content && { content }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new Error('수정할 내용이 없습니다.');
    }

    const articleComment = await this.articleCommentRepository.updateArticleComment(id, updateData);

    return articleComment;
  };

  // 게시글 댓글 삭제
  public deleteArticleComment = async (id: string) => {
    return await this.articleCommentRepository.deleteArticleComment(id);
  };
}
