import { ArticleService } from '../../../src/modules/articles/article.service.js';
import { ArticleRepository } from '../../../src/modules/articles/article.repository.js';
import * as s3 from '../../../src/lib/s3-service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockArticleRepository = {
  getArticles: vi.fn(),
  getArticleById: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
};

describe('ArticleService 유닛 테스트', () => {
  let articleService: ArticleService;

  const userId = 'user-id-1';
  const articleId = 'article-id-1';
  const resource = {
    id: articleId,
    title: '기존 제목',
    content: '기존 내용',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    articleImages: [
      {
        id: 'image-id-1',
        fileUrl: 'https://fake-url.com/image-1.png',
        key: 'image-1.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        articleId: articleId,
      },
    ],
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    articleService = new ArticleService(mockArticleRepository as unknown as ArticleRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 모든 게시글 조회
  describe('getArticles', () => {
    it('(로그인 사용자) 게시글 목록을 정상적으로 조회하고, isLiked 필드를 추가해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockArticles = [
        { id: 'article-1', title: '제목 1', articleLikes: [{ id: 'like-1' }] },
        { id: 'article-2', title: '제목 2', articleLikes: [] },
      ];
      mockArticleRepository.getArticles.mockResolvedValue(mockArticles);

      // --- 실행 (Act) ---
      const result = await articleService.getArticles({}, userId);

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.getArticles).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { id: 'article-1', title: '제목 1', isLiked: true },
        { id: 'article-2', title: '제목 2', isLiked: false },
      ]);
    });

    it('(비로그인 사용자) 게시글 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockArticles = [
        { id: 'article-1', title: '제목 1', articleLikes: [] },
        { id: 'article-2', title: '제목 2', articleLikes: [] },
      ];
      mockArticleRepository.getArticles.mockResolvedValue(mockArticles);

      // --- 실행 (Act) ---
      const result = await articleService.getArticles({}, null);

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.getArticles).toHaveBeenCalledTimes(1);
      expect(result[0].isLiked).toBe(false);
    });

    it('오래된 순 정렬(order=old)이 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleRepository.getArticles.mockResolvedValue([]);

      // --- 실행 (Act) ---
      await articleService.getArticles({ order: 'old' }, userId);

      const getQuery = {
        where: {},
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 10,
      };

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.getArticles).toHaveBeenCalledWith(
        expect.objectContaining(getQuery),
        expect.any(Object),
      );
    });

    it('검색어가 포함된 게시글 목록을 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const search = '검색';
      mockArticleRepository.getArticles.mockResolvedValue([]);

      // --- 실행 (Act) ---
      await articleService.getArticles({ search }, userId);

      const where = {
        where: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.getArticles).toHaveBeenCalledWith(
        expect.objectContaining(where),
        expect.any(Object),
      );
    });
  });

  // 특정 게시글 조회
  describe('getArticleById', () => {
    it('특정 ID의 게시글을 정상적으로 조회하고, isLiked 필드를 추가해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockArticle = {
        ...resource,
        articleLikes: [{ id: 'like-1' }],
      };
      mockArticleRepository.getArticleById.mockResolvedValue(mockArticle);

      // --- 실행 (Act) ---
      const result = await articleService.getArticleById(articleId, userId);

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.getArticleById).toHaveBeenCalledTimes(1);
      expect(mockArticleRepository.getArticleById).toHaveBeenCalledWith(articleId, userId);
      expect(result.isLiked).toBe(true);
    });

    it('존재하지 않는 게시글 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleRepository.getArticleById.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(articleService.getArticleById('non-existent-id', userId)).rejects.toThrow(
        '게시글을 찾을 수 없습니다.',
      );
    });
  });

  // 게시글 생성
  describe('createArticle', () => {
    it('이미지를 포함하여 게시글을 정상적으로 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        title: '테스트 제목',
        content: '테스트 내용',
        imageKeys: ['image-1.png'],
      };
      const mockCreatedArticle = {
        id: articleId,
        ...data,
      };
      const fileUrl = `https://fake-url.com/${data.imageKeys[0]}}`;

      mockArticleRepository.createArticle.mockResolvedValue(mockCreatedArticle);
      const permanentKeySpy = vi.spyOn(s3, 'moveFileToPermanent').mockResolvedValue(data.imageKeys[0]);
      const fileUrlSpy = vi.spyOn(s3, 'getFileUrl').mockReturnValue(fileUrl);

      // --- 실행 (Act) ---
      const result = await articleService.createArticle(userId, data);

      const imagesData = [{ key: data.imageKeys[0], fileUrl }];

      const createData = {
        title: data.title,
        content: data.content,
        user: {
          connect: { id: userId },
        },
        articleImages: {
          create: imagesData,
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.createArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleRepository.createArticle).toHaveBeenCalledWith(createData);
      expect(permanentKeySpy).toHaveBeenCalledTimes(1);
      expect(permanentKeySpy).toHaveBeenCalledWith(data.imageKeys[0], 'articles');
      expect(fileUrlSpy).toHaveBeenCalledTimes(1);
      expect(fileUrlSpy).toHaveBeenCalledWith(data.imageKeys[0]);
      expect(result).toEqual(mockCreatedArticle);
    });

    it('이미지 없이 게시글을 정상적으로 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        title: '테스트 제목',
        content: '테스트 내용',
      };
      const mockCreatedArticle = {
        id: articleId,
        ...data,
      };
      mockArticleRepository.createArticle.mockResolvedValue(mockCreatedArticle);

      // --- 실행 (Act) ---
      const result = await articleService.createArticle(userId, data);

      const createData = {
        title: data.title,
        content: data.content,
        user: {
          connect: { id: userId },
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.createArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleRepository.createArticle).toHaveBeenCalledWith(createData);
      expect(mockArticleRepository.createArticle).toHaveBeenCalledWith(
        expect.not.objectContaining({ articleImages: expect.any(Object) }),
      );
      expect(result).toEqual(mockCreatedArticle);
    });
  });

  // 게시글 수정
  describe('updateArticle', () => {
    it('게시글을 정상적으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        title: '수정된 제목',
        content: '수정된 내용',
        imageKeys: ['image-2.png'],
      };
      const mockUpdatedArticle = {
        id: articleId,
        ...data,
      };
      const fileUrl = `https://fake-url.com/${data.imageKeys[0]}}`;

      mockArticleRepository.updateArticle.mockResolvedValue(mockUpdatedArticle);
      const permanentKeySpy = vi.spyOn(s3, 'moveFileToPermanent').mockResolvedValue(data.imageKeys[0]);
      const fileUrlSpy = vi.spyOn(s3, 'getFileUrl').mockReturnValue(fileUrl);

      // --- 실행 (Act) ---
      const result = await articleService.updateArticle(articleId, data, resource);

      const imagesData = [{ key: data.imageKeys[0], fileUrl }];

      const updateData = {
        title: data.title,
        content: data.content,
        articleImages: {
          disconnect: resource.articleImages.map((image) => ({ id: image.id })),
          create: imagesData,
        },
      };

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.updateArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleRepository.updateArticle).toHaveBeenCalledWith(articleId, updateData);
      expect(permanentKeySpy).toHaveBeenCalledTimes(1);
      expect(permanentKeySpy).toHaveBeenCalledWith(data.imageKeys[0], 'articles');
      expect(fileUrlSpy).toHaveBeenCalledTimes(1);
      expect(fileUrlSpy).toHaveBeenCalledWith(data.imageKeys[0]);
      expect(result).toEqual(mockUpdatedArticle);
    });

    it('수정할 내용이 없을 때 BadRequestError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        title: resource.title,
        content: resource.content,
      };

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(articleService.updateArticle(articleId, data, resource)).rejects.toThrow('수정할 내용이 없습니다.');
    });
  });

  // 게시글 삭제
  describe('deleteArticle', () => {
    it('게시글을 정상적으로 삭제해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockArticleRepository.deleteArticle.mockResolvedValue({ id: articleId });

      // --- 실행 (Act) ---
      await articleService.deleteArticle(articleId);

      // --- 검증 (Assert) ---
      expect(mockArticleRepository.deleteArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleRepository.deleteArticle).toHaveBeenCalledWith(articleId);
    });
  });
});
