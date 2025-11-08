import { ArticleCommentService } from '../../../src/modules/articleComments/articleComment.service.js';
import { ArticleCommentRepository } from '../../../src/modules/articleComments/articleComment.repository.js';
import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockArticleCommentRepository = {
  getArticleComments: vi.fn(),
  getArticleCommentById: vi.fn(),
  createArticleComment: vi.fn(),
  updateArticleComment: vi.fn(),
  deleteArticleComment: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

describe('ArticleCommentService 유닛 테스트', () => {
  let articleCommentService: ArticleCommentService;

  const articleId = 'article-id-1';
  const userId = 'commenter-id-1';
  const articleAuthorId = 'author-id-1';
  const commentId = 'comment-id-1';
  const resource = {
    id: commentId,
    content: '기존 댓글 내용',
    userId: userId,
    articleId: articleId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    articleCommentService = new ArticleCommentService(
      mockArticleCommentRepository as unknown as ArticleCommentRepository,
      mockNotificationService as unknown as NotificationService,
    );
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 게시글 모든 댓글 조회
  describe('getArticleComments', () => {
    it('게시글의 댓글 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockComments = [
        { id: 'comment-1', content: '댓글 1' },
        { id: 'comment-2', content: '댓글 2' },
      ];
      mockArticleCommentRepository.getArticleComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      const result = await articleCommentService.getArticleComments({ limit: 10 }, articleId);

      const getQuery = {
        where: {
          articleId,
        },
        skip: 0,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.getArticleComments).toHaveBeenCalledTimes(1);
      expect(mockArticleCommentRepository.getArticleComments).toHaveBeenCalledWith(getQuery);
      expect(result.articleComments).toEqual(mockComments);
    });

    it('커서 기반 페이지네이션이 올바르게 작동해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const cursor = 'comment-2';
      const mockComments = [{ id: 'comment-3', content: '댓글 3' }];
      mockArticleCommentRepository.getArticleComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      const result = await articleCommentService.getArticleComments({ limit: 10, cursor }, articleId);

      const getQuery = {
        where: { articleId },
        take: 10,
        skip: 1,
        cursor: { id: cursor },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.getArticleComments).toHaveBeenCalledWith(getQuery);
      expect(result.nextCursor).toBe('comment-3');
    });

    it('댓글이 더 이상 없을 때 nextCursor는 null을 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleCommentRepository.getArticleComments.mockResolvedValue([]);

      // --- 실행 (Act) ---
      const result = await articleCommentService.getArticleComments({ limit: 10 }, articleId);

      // --- 검증 (Assert) ---
      expect(result.articleComments).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it('검색어가 포함된 댓글 목록을 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const search = '검색';
      const mockComments = [{ id: 'comment-1', content: '검색된 댓글' }];
      mockArticleCommentRepository.getArticleComments.mockResolvedValue(mockComments);

      // --- 실행 (Act) ---
      await articleCommentService.getArticleComments({ search }, articleId);

      const where = {
        where: {
          articleId,
          OR: [{ content: { contains: search, mode: 'insensitive' } }],
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.getArticleComments).toHaveBeenCalledWith(expect.objectContaining(where));
    });
  });

  // 게시글 특정 댓글 조회
  describe('getArticleCommentById', () => {
    it('특정 ID의 댓글을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleCommentRepository.getArticleCommentById.mockResolvedValue(resource);

      // --- 실행 (Act) ---
      const result = await articleCommentService.getArticleCommentById(commentId);

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.getArticleCommentById).toHaveBeenCalledTimes(1);
      expect(mockArticleCommentRepository.getArticleCommentById).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(resource);
    });

    it('존재하지 않는 댓글 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleCommentRepository.getArticleCommentById.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(articleCommentService.getArticleCommentById('non-existent-id')).rejects.toThrow(
        '댓글을 찾을 수 없습니다.',
      );
    });
  });

  // 게시글 댓글 생성
  describe('createArticleComment', () => {
    it('댓글 작성자가 게시글 작성자가 아닐 경우, 댓글과 알림을 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 생성 댓글',
      };
      const mockCreatedComment = {
        id: commentId,
        ...data,
        article: {
          id: articleId,
          user: {
            id: articleAuthorId,
          },
        },
      };
      mockArticleCommentRepository.createArticleComment.mockResolvedValue(mockCreatedComment);

      // --- 실행 (Act) ---
      const result = await articleCommentService.createArticleComment(articleId, userId, data);

      const createData = {
        content: data.content,
        article: {
          connect: { id: articleId },
        },
        user: {
          connect: { id: userId },
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.createArticleComment).toHaveBeenCalledTimes(1);
      expect(mockArticleCommentRepository.createArticleComment).toHaveBeenCalledWith(createData);

      // 알림 확인
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        recipientId: articleAuthorId,
        senderId: userId,
        entityId: articleId,
        type: 'ARTICLE_COMMENT',
        message: '누군가 당신의 게시글에 댓글을 남겼어요.',
      });
      expect(result).toEqual(mockCreatedComment);
    });

    it('댓글 작성자가 게시글 작성자일 경우, 알림은 제외하고 댓글만 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 생성 댓글',
      };
      const mockCreatedComment = {
        id: commentId,
        ...data,
        article: {
          id: articleId,
          user: {
            id: userId,
          },
        },
      };
      mockArticleCommentRepository.createArticleComment.mockResolvedValue(mockCreatedComment);

      // --- 실행 (Act) ---
      await articleCommentService.createArticleComment(articleId, userId, data);

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.createArticleComment).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });
  });

  // 게시글 댓글 수정
  describe('updateArticleComment', () => {
    it('게시글의 댓글을 정상적으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: '테스트 수정 댓글',
      };
      const mockUpdatedComment = {
        id: commentId,
        ...data,
      };
      mockArticleCommentRepository.updateArticleComment.mockResolvedValue(mockUpdatedComment);

      // --- 실행 (Act) ---
      const result = await articleCommentService.updateArticleComment(commentId, data, resource);

      const updateData = {
        content: data.content,
      };

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.updateArticleComment).toHaveBeenCalledTimes(1);
      expect(mockArticleCommentRepository.updateArticleComment).toHaveBeenCalledWith(commentId, updateData);
      expect(result).toEqual(mockUpdatedComment);
    });

    it('수정할 내용이 없을 때 BadRequestError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        content: resource.content,
      };

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(articleCommentService.updateArticleComment(commentId, data, resource)).rejects.toThrow(
        '수정할 내용이 없습니다.',
      );
    });
  });

  // 게시글 댓글 삭제
  describe('deleteArticleComment', () => {
    it('게시글의 댓글을 정상적으로 삭제해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleCommentRepository.deleteArticleComment.mockResolvedValue({ id: commentId });

      // --- 실행 (Act) ---
      await articleCommentService.deleteArticleComment(commentId);

      // --- 검증 (Assert) ---
      expect(mockArticleCommentRepository.deleteArticleComment).toHaveBeenCalledTimes(1);
      expect(mockArticleCommentRepository.deleteArticleComment).toHaveBeenCalledWith(commentId);
    });
  });
});
