import { ProductLikeRepository } from './productLike.repository.js';
import type { Prisma } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service.js';
import type { CreateNotificationBody } from '../notifications/notification.dto.js';

export class ProductLikeService {
  constructor(
    private productLikeRepository: ProductLikeRepository,
    private notificationService: NotificationService,
  ) {}

  // 상품 좋아요 생성 (토글)
  public createProductLike = async (productId: string, userId: string) => {
    // 기존 좋아요 취소
    const deleteCount = await this.productLikeRepository.deleteProductLike(productId, userId);

    // 좋아요 취소
    if (deleteCount.count > 0) {
      return null;
    }

    // 좋아요 생성
    const createData: Prisma.ProductLikeCreateInput = {
      product: {
        connect: { id: productId },
      },
      user: {
        connect: { id: userId },
      },
    };

    const productLike = await this.productLikeRepository.createProductLike(createData);

    // 알림 생성
    if (productLike.product.user.id !== userId) {
      // TO DO 나중에 동일 상품에 알림 1번만 가게 수정
      // 알림 중복 방지: 동일 사용자가 동일 상품에 대해 이미 좋아요 알림을 받았는지 확인합니다.
      // const hasSentInitialLikeNotification = await this.notificationService.hasSentInitialLikeNotification(
      //   productLike.product.id, // entityId
      //   productOwnerId,          // recipientId
      //   userId                   // senderId
      // );

      const notificationData: CreateNotificationBody = {
        recipientId: productLike.product.user.id,
        senderId: userId,
        entityId: productLike.product.id,
        type: 'PRODUCT_LIKE',
        message: '누군가 당신의 상품에 ‘좋아요’를 눌렀어요.',
      };

      await this.notificationService.createNotification(notificationData);
    }

    return productLike;
  };
}
