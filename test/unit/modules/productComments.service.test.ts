import { ProductCommentService } from '../../../src/modules/productComments/productComment.service.js';
import { ProductCommentRepository } from '../../../src/modules/productComments/productComment.repository.js';
import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockProductCommentRepository = {
  getProductComments: vi.fn(),
  getProductCommentById: vi.fn(),
  createProductComment: vi.fn(),
  updateProductComment: vi.fn(),
  deleteProductComment: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

describe('ProductCommentService 유닛 테스트', () => {
  let productCommentService: ProductCommentService;

  const productId = 'product-id-1';
  const userId = 'commenter-id-1';
  const productAuthorId = 'author-id-1';
  const commentId = 'comment-id-1';
  const resource = {
    id: commentId,
    content: '기존 댓글 내용',
    userId: userId,
    productId: productId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    productCommentService = new ProductCommentService(
      mockProductCommentRepository as unknown as ProductCommentRepository,
      mockNotificationService as unknown as NotificationService,
    );
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 상품 모든 댓글 조회
  describe('getProductComments', () => {
    it('상품의 댓글 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockComments = [
        { id: 'comment-1', content: '댓글 1' },
        { id: 'comment-2', content: '댓글 2' },
      ];
      mockProductCommentRepository.getProductComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      const result = await productCommentService.getProductComments({ limit: 10 }, productId);

      const getQuery = {
        where: {
          productId,
        },
        skip: 0,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.getProductComments).toHaveBeenCalledTimes(1);
      expect(mockProductCommentRepository.getProductComments).toHaveBeenCalledWith(getQuery);
      expect(result.productComments).toEqual(mockComments);
    });

    it('커서 기반 페이지네이션이 올바르게 작동해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const cursor = 'comment-2';
      const mockComments = [{ id: 'comment-3', content: '댓글 3' }];
      mockProductCommentRepository.getProductComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      const result = await productCommentService.getProductComments({ limit: 10, cursor }, productId);

      const getQuery = {
        where: { productId },
        take: 10,
        skip: 1,
        cursor: { id: cursor },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.getProductComments).toHaveBeenCalledWith(getQuery);
      expect(result.nextCursor).toBe('comment-3');
    });

    it('댓글이 더 이상 없을 때 nextCursor는 null을 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductCommentRepository.getProductComments.mockResolvedValue([]);

      // --- 실행 (Act) ---
      const result = await productCommentService.getProductComments({ limit: 10 }, productId);

      // --- 검증 (Assert) ---
      expect(result.productComments).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it('검색어가 포함된 댓글 목록을 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const search = '검색';
      const mockComments = [{ id: 'comment-1', content: '검색된 댓글' }];
      mockProductCommentRepository.getProductComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      await productCommentService.getProductComments({ search }, productId);

      const where = {
        where: {
          productId,
          OR: [{ content: { contains: search, mode: 'insensitive' } }],
        },
      };

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.getProductComments).toHaveBeenCalledWith(expect.objectContaining(where));
    });
  });

  // 상품 특정 댓글 조회
  describe('getProductCommentById', () => {
    it('특정 ID의 댓글을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductCommentRepository.getProductCommentById.mockResolvedValue(resource);

      // --- 실행 (Act) ---
      const result = await productCommentService.getProductCommentById(commentId);

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.getProductCommentById).toHaveBeenCalledTimes(1);
      expect(mockProductCommentRepository.getProductCommentById).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(resource);
    });

    it('존재하지 않는 댓글 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductCommentRepository.getProductCommentById.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(productCommentService.getProductCommentById('non-existent-id')).rejects.toThrow(
        '댓글을 찾을 수 없습니다.',
      );
    });
  });

  // 상품 댓글 생성
  describe('createProductComment', () => {
    it('댓글 작성자가 상품 작성자가 아닐 경우, 댓글과 알림을 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 생성 댓글',
      };
      const mockCreatedComment = {
        id: commentId,
        ...data,
        product: {
          id: productId,
          user: {
            id: productAuthorId,
          },
        },
      };
      mockProductCommentRepository.createProductComment.mockResolvedValue(mockCreatedComment);

      // --- 실행 (Act) ---
      const result = await productCommentService.createProductComment(productId, userId, data);

      const createData = {
        content: data.content,
        product: {
          connect: { id: productId },
        },
        user: {
          connect: { id: userId },
        },
      };

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.createProductComment).toHaveBeenCalledTimes(1);
      expect(mockProductCommentRepository.createProductComment).toHaveBeenCalledWith(createData);

      // 알림 확인
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        recipientId: productAuthorId,
        senderId: userId,
        entityId: productId,
        type: 'PRODUCT_COMMENT',
        message: '누군가 당신의 상품에 댓글을 남겼어요.',
      });
      expect(result).toEqual(mockCreatedComment);
    });

    it('댓글 작성자가 상품 작성자일 경우, 알림은 제외하고 댓글만 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 생성 댓글',
      };
      const mockCreatedComment = {
        id: commentId,
        ...data,
        product: {
          id: productId,
          user: {
            id: userId,
          },
        },
      };
      mockProductCommentRepository.createProductComment.mockResolvedValue(mockCreatedComment);

      // --- 실행 (Act) ---
      await productCommentService.createProductComment(productId, userId, data);

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.createProductComment).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });
  });

  // 상품 댓글 수정
  describe('updateProductComment', () => {
    it('상품의 댓글을 정상적으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 수정 댓글',
      };
      const mockUpdatedComment = {
        id: commentId,
        ...data,
      };
      mockProductCommentRepository.updateProductComment.mockResolvedValue(mockUpdatedComment);

      // --- 실행 (Act) ---
      const result = await productCommentService.updateProductComment(commentId, data, resource);

      const updateData = {
        content: data.content,
      };

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.updateProductComment).toHaveBeenCalledTimes(1);
      expect(mockProductCommentRepository.updateProductComment).toHaveBeenCalledWith(commentId, updateData);
      expect(result).toEqual(mockUpdatedComment);
    });

    it('수정할 내용이 없을 때 BadRequestError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: resource.content,
      };

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(productCommentService.updateProductComment(commentId, data, resource)).rejects.toThrow(
        '수정할 내용이 없습니다.',
      );
    });
  });

  // 상품 댓글 삭제
  describe('deleteProductComment', () => {
    it('상품의 댓글을 정상적으로 삭제해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductCommentRepository.deleteProductComment.mockResolvedValue({ id: commentId });

      // --- 실행 (Act) ---
      await productCommentService.deleteProductComment(commentId);

      // --- 검증 (Assert) ---
      expect(mockProductCommentRepository.deleteProductComment).toHaveBeenCalledTimes(1);
      expect(mockProductCommentRepository.deleteProductComment).toHaveBeenCalledWith(commentId);
    });
  });
});
