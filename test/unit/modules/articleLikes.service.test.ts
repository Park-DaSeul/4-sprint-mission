import { ArticleLikeService } from '../../../src/modules/articleLikes/articleLike.service.js';
import { ArticleLikeRepository } from '../../../src/modules/articleLikes/articleLike.repository.js';
import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockArticleLikeRepository = {
  createArticleLike: vi.fn(),
  deleteArticleLike: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

describe('ArticleLikeService 유닛 테스트', () => {
  let articleLikeService: ArticleLikeService;

  const articleId = 'article-id-1';
  const userId = 'liker-id-1';
  const articleAuthorId = 'author-id-1';
  const likeId = 'like-id-1';

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    articleLikeService = new ArticleLikeService(
      mockArticleLikeRepository as unknown as ArticleLikeRepository,
      mockNotificationService as unknown as NotificationService,
    );
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 게시글 좋아요 토글
  describe('createArticleLike', () => {
    it('좋아요를 생성자가 게시글 작성자가 아닐 경우, 좋아요와 알림을 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockCreatedLike = {
        id: likeId,
        article: {
          id: articleId,
          user: {
            id: articleAuthorId,
          },
        },
      };
      mockArticleLikeRepository.createArticleLike.mockResolvedValue(mockCreatedLike);
      mockArticleLikeRepository.deleteArticleLike.mockResolvedValue({ count: 0 });

      // --- 실행 (Act) ---
      const result = await articleLikeService.createArticleLike(articleId, userId);

      const createData = {
        article: {
          connect: { id: articleId },
        },
        user: {
          connect: { id: userId },
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleLikeRepository.deleteArticleLike).toHaveBeenCalledTimes(1);
      expect(mockArticleLikeRepository.deleteArticleLike).toHaveBeenCalledWith(articleId, userId);

      expect(mockArticleLikeRepository.createArticleLike).toHaveBeenCalledTimes(1);
      expect(mockArticleLikeRepository.createArticleLike).toHaveBeenCalledWith(createData);

      // 알림 확인
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        recipientId: articleAuthorId,
        senderId: userId,
        entityId: articleId,
        type: 'ARTICLE_LIKE',
        message: '누군가 당신의 게시글에 ‘좋아요’를 눌렀어요.',
      });

      expect(result).toEqual(mockCreatedLike);
    });

    it('좋아요를 생성자가 게시글 작성자일 경우, 알림은 제외하고 좋아요만 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockCreatedLike = {
        id: likeId,
        article: {
          id: articleId,
          user: {
            id: userId,
          },
        },
      };
      mockArticleLikeRepository.createArticleLike.mockResolvedValue(mockCreatedLike);
      mockArticleLikeRepository.deleteArticleLike.mockResolvedValue({ count: 0 });

      // --- 실행 (Act) ---
      const result = await articleLikeService.createArticleLike(articleId, userId);

      // --- 검증 (Assert) ---
      expect(mockArticleLikeRepository.deleteArticleLike).toHaveBeenCalledWith(articleId, userId);
      expect(mockArticleLikeRepository.createArticleLike).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedLike);
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });

    it('게시글에 이미 좋아요를 누른 경우 좋아요를 취소해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleLikeRepository.createArticleLike.mockResolvedValue(null);
      mockArticleLikeRepository.deleteArticleLike.mockResolvedValue({ count: 1 });

      // --- 실행 (Act) ---
      const result = await articleLikeService.createArticleLike(articleId, userId);

      // --- 검증 (Assert) ---
      expect(mockArticleLikeRepository.deleteArticleLike).toHaveBeenCalledTimes(1);
      expect(mockArticleLikeRepository.deleteArticleLike).toHaveBeenCalledWith(articleId, userId);
      expect(mockArticleLikeRepository.createArticleLike).toHaveBeenCalledTimes(0);
      expect(result).toBeNull();
    });
  });
});
