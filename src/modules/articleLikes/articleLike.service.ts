import { ArticleLikeRepository } from './articleLike.repository.js';
import type { Prisma } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service.js';
import type { CreateNotificationBody } from '../notifications/notification.dto.js';

export class ArticleLikeService {
  constructor(
    private articleLikeRepository: ArticleLikeRepository,
    private notificationService: NotificationService,
  ) {}

  // 게시글 좋아요 생성 (토글)
  public createArticleLike = async (articleId: string, userId: string) => {
    // 좋아요 눌렀는지 확인
    const deleteCount = await this.articleLikeRepository.deleteArticleLike(articleId, userId);

    // 좋아요 취소
    if (deleteCount.count > 0) {
      return null;
    }

    // 좋아요 생성
    const createData: Prisma.ArticleLikeCreateInput = {
      article: {
        connect: { id: articleId },
      },
      user: {
        connect: { id: userId },
      },
    };

    const articleLike = await this.articleLikeRepository.createArticleLike(createData);

    // 알림 생성
    if (articleLike.article.user.id !== userId) {
      // TO DO 나중에 동일 상품에 알림 1번만 가게 수정
      // 알림 중복 방지: 동일 사용자가 동일 상품에 대해 이미 좋아요 알림을 받았는지 확인합니다.
      // const hasSentInitialLikeNotification = await this.notificationService.hasSentInitialLikeNotification(
      //   productLike.product.id, // entityId
      //   productOwnerId,          // recipientId
      //   userId                   // senderId
      // );

      const notificationData: CreateNotificationBody = {
        recipientId: articleLike.article.user.id,
        senderId: userId,
        entityId: articleLike.article.id,
        type: 'ARTICLE_LIKE',
        message: '누군가 당신의 게시글에 ‘좋아요’를 눌렀어요.',
      };

      await this.notificationService.createNotification(notificationData);
    }

    return articleLike;
  };
}
