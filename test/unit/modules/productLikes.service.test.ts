import { ProductLikeService } from '../../../src/modules/productLikes/productLike.service.js';
import { ProductLikeRepository } from '../../../src/modules/productLikes/productLike.repository.js';
import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockProductLikeRepository = {
  createProductLike: vi.fn(),
  deleteProductLike: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

describe('ProductLikeService 유닛 테스트', () => {
  let productLikeService: ProductLikeService;

  const productId = 'product-id-1';
  const userId = 'liker-id-1';
  const productAuthorId = 'author-id-1';
  const likeId = 'like-id-1';

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    productLikeService = new ProductLikeService(
      mockProductLikeRepository as unknown as ProductLikeRepository,
      mockNotificationService as unknown as NotificationService,
    );
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 상품 좋아요 토글
  describe('createProductLike', () => {
    it('좋아요를 생성자가 상품 작성자가 아닐 경우, 좋아요와 알림을 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockCreatedLike = {
        id: likeId,
        product: {
          id: productId,
          user: {
            id: productAuthorId,
          },
        },
      };
      mockProductLikeRepository.createProductLike.mockResolvedValue(mockCreatedLike);
      mockProductLikeRepository.deleteProductLike.mockResolvedValue({ count: 0 });

      // --- 실행 (Act) ---
      const result = await productLikeService.createProductLike(productId, userId);

      const createData = {
        product: {
          connect: { id: productId },
        },
        user: {
          connect: { id: userId },
        },
      };

      // --- 검증 (Assert) ---
      expect(mockProductLikeRepository.deleteProductLike).toHaveBeenCalledTimes(1);
      expect(mockProductLikeRepository.deleteProductLike).toHaveBeenCalledWith(productId, userId);

      expect(mockProductLikeRepository.createProductLike).toHaveBeenCalledTimes(1);
      expect(mockProductLikeRepository.createProductLike).toHaveBeenCalledWith(createData);

      // 알림 확인
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        recipientId: productAuthorId,
        senderId: userId,
        entityId: productId,
        type: 'PRODUCT_LIKE',
        message: '누군가 당신의 상품에 ‘좋아요’를 눌렀어요.',
      });

      expect(result).toEqual(mockCreatedLike);
    });

    it('좋아요를 생성자가 상품 작성자일 경우, 알림은 제외하고 좋아요만 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockCreatedLike = {
        id: likeId,
        product: {
          id: productId,
          user: {
            id: userId,
          },
        },
      };
      mockProductLikeRepository.createProductLike.mockResolvedValue(mockCreatedLike);
      mockProductLikeRepository.deleteProductLike.mockResolvedValue({ count: 0 });

      // --- 실행 (Act) ---
      const result = await productLikeService.createProductLike(productId, userId);

      // --- 검증 (Assert) ---
      expect(mockProductLikeRepository.deleteProductLike).toHaveBeenCalledWith(productId, userId);
      expect(mockProductLikeRepository.createProductLike).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedLike);
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });

    it('상품에 이미 좋아요를 누른 경우 좋아요를 취소해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductLikeRepository.createProductLike.mockResolvedValue(null);
      mockProductLikeRepository.deleteProductLike.mockResolvedValue({ count: 1 });

      // --- 실행 (Act) ---
      const result = await productLikeService.createProductLike(productId, userId);

      // --- 검증 (Assert) ---
      expect(mockProductLikeRepository.deleteProductLike).toHaveBeenCalledTimes(1);
      expect(mockProductLikeRepository.deleteProductLike).toHaveBeenCalledWith(productId, userId);
      expect(mockProductLikeRepository.createProductLike).toHaveBeenCalledTimes(0);
      expect(result).toBeNull();
    });
  });
});
