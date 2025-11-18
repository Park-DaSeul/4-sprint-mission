import { ProductImageService } from '../../../src/modules/productImages/productImage.service.js';
import { ProductImageRepository } from '../../../src/modules/productImages/productImage.repository.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockRProductImageRepository = {
  createProductImage: vi.fn(),
};

describe('ProductImageService 유닛 테스트', () => {
  let productImageService: ProductImageService;

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    productImageService = new ProductImageService(mockRProductImageRepository as unknown as ProductImageRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 상품 사진 생성 (업로드)
  describe('createProductImage', () => {
    it('상품 사진을 정상적으로 생성해야 한다.', async () => {
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
      mockRProductImageRepository.createProductImage.mockResolvedValue(mockCreatedImage);

      // --- 실행 (Act) ---
      const result = await productImageService.createProductImage(data);

      const createData = {
        publicId: data.publicId,
        fileUrl: data.fileUrl,
      };

      // --- 검증 (Assert) ---
      expect(mockRProductImageRepository.createProductImage).toHaveBeenCalledTimes(1);
      expect(mockRProductImageRepository.createProductImage).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedImage);
    });
  });
});
