import { ArticleImageService } from '../../../src/modules/articleImages/articleImage.service.js';
import { ArticleImageRepository } from '../../../src/modules/articleImages/articleImage.repository.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockRArticleImageRepository = {
  createArticleImage: vi.fn(),
};

describe('ArticleImageService 유닛 테스트', () => {
  let articleImageService: ArticleImageService;

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    articleImageService = new ArticleImageService(mockRArticleImageRepository as unknown as ArticleImageRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 게시글 사진 생성 (업로드)
  describe('createArticleImage', () => {
    it('게시글 사진을 정상적으로 생성해야 한다.', async () => {
      const data = {
        publicId: 'test-public-id',
        fileUrl: 'http://test.com/image.jpg',
      };

      // --- 준비 (Arrange) ---
      const mockCreatedImage = {
        id: 'image-id-1',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRArticleImageRepository.createArticleImage.mockResolvedValue(mockCreatedImage);

      // --- 실행 (Act) ---
      const result = await articleImageService.createArticleImage(data);

      const createData = {
        publicId: data.publicId,
        fileUrl: data.fileUrl,
      };

      // --- 검증 (Assert) ---
      expect(mockRArticleImageRepository.createArticleImage).toHaveBeenCalledTimes(1);
      expect(mockRArticleImageRepository.createArticleImage).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedImage);
    });
  });
});
