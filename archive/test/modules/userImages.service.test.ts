import { UserImageService } from '../../../src/modules/userImages/userImage.service.js';
import { UserImageRepository } from '../../../src/modules/userImages/userImage.repository.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockRUserImageRepository = {
  createUserImage: vi.fn(),
};

describe('UserImageService 유닛 테스트', () => {
  let userImageService: UserImageService;

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    userImageService = new UserImageService(mockRUserImageRepository as unknown as UserImageRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 사용자 사진 생성 (업로드)
  describe('createUserImage', () => {
    it('사용자 사진을 정상적으로 생성해야 한다.', async () => {
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
      mockRUserImageRepository.createUserImage.mockResolvedValue(mockCreatedImage);

      // --- 실행 (Act) ---
      const result = await userImageService.createUserImage(data);

      const createData = {
        publicId: data.publicId,
        fileUrl: data.fileUrl,
      };

      // --- 검증 (Assert) ---
      expect(mockRUserImageRepository.createUserImage).toHaveBeenCalledTimes(1);
      expect(mockRUserImageRepository.createUserImage).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedImage);
    });
  });
});
