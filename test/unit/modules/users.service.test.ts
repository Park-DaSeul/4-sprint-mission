import { UserService } from '../../../src/modules/users/user.service.js';
import { UserRepository } from '../../../src/modules/users/user.repository.js';
import * as common from '../../../src/common/index.js';
import * as s3 from '../../../src/lib/s3-service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockUserRepository = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserProduct: vi.fn(),
  getUserLike: vi.fn(),
};

describe('UserService 유닛 테스트', () => {
  let userService: UserService;

  const userId = 'user-id-1';
  const password = 'password';
  const hashedPassword = 'hashedPassword';
  const newHashedPassword = 'new-password';
  const resource = {
    id: userId,
    nickname: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    userService = new UserService(mockUserRepository as unknown as UserRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 사용자 조회
  describe('getUser', () => {
    it('자신의 정보를 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockUserRepository.getUser.mockResolvedValue(resource);

      // --- 실행 (Act) ---
      const result = await userService.getUser(userId);

      // --- 검증 (Assert) ---
      expect(mockUserRepository.getUser).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(resource);
    });
  });

  // 사용자 수정
  describe('updateUser', () => {
    it('자신의 정보를 정상적으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        nickname: 'new-nickname',
        password: password,
        newPassword: newHashedPassword,
        imageKey: 'image-1.png',
      };
      const mockUpdatedUser = {
        id: userId,
        ...data,
      };
      const fileUrl = `https://fake-url.com/${data.imageKey}}`;

      const verifySpy = vi.spyOn(common, 'verifyPassword').mockResolvedValue(undefined);
      const hashSpy = vi.spyOn(common, 'hashPassword').mockResolvedValue(newHashedPassword);
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);
      const permanentKeySpy = vi.spyOn(s3, 'moveFileToPermanent').mockResolvedValue(data.imageKey);
      const fileUrlSpy = vi.spyOn(s3, 'getFileUrl').mockReturnValue(fileUrl);

      // --- 실행 (Act) ---
      const result = await userService.updateUser(userId, data, resource);

      const imageData = { key: data.imageKey, fileUrl };

      const updateData = {
        nickname: data.nickname,
        password: newHashedPassword,
        userImage: {
          disconnect: true,
          create: imageData,
        },
      };

      // --- 검증 (Assert) ---
      expect(verifySpy).toHaveBeenCalledWith(data.password, resource.password);
      expect(hashSpy).toHaveBeenCalledWith(data.newPassword);
      expect(mockUserRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(permanentKeySpy).toHaveBeenCalledTimes(1);
      expect(permanentKeySpy).toHaveBeenCalledWith(data.imageKey, 'users');
      expect(fileUrlSpy).toHaveBeenCalledTimes(1);
      expect(fileUrlSpy).toHaveBeenCalledWith(data.imageKey);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('수정할 내용이 없을 때 BadRequestError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        nickname: resource.nickname,
      };

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(userService.updateUser(userId, data, resource)).rejects.toThrow('수정할 내용이 없습니다.');
    });
  });

  // 사용자 삭제
  describe('deleteUser', () => {
    it('사용자를 정상적으로 삭제해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = { password: password };

      const verifySpy = vi.spyOn(common, 'verifyPassword').mockResolvedValue(undefined);
      mockUserRepository.deleteUser.mockResolvedValue(resource);

      // --- 실행 (Act) ---
      await userService.deleteUser(userId, data, resource);

      // --- 검증 (Assert) ---
      expect(verifySpy).toHaveBeenCalledWith(data.password, resource.password);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  // 사용자가 등록한 상품 조회
  describe('getUserProduct', () => {
    it('사용자가 등록한 상품 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockProducts = {
        products: [{ id: 'product-1' }, { id: 'product-2' }],
      };
      mockUserRepository.getUserProduct.mockResolvedValue(mockProducts);

      // --- 실행 (Act) ---
      const result = await userService.getUserProduct(userId);

      // --- 검증 (Assert) ---
      expect(mockUserRepository.getUserProduct).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getUserProduct).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProducts.products);
    });

    it('존재하지 않는 사용자 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockUserRepository.getUserProduct.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(userService.getUserProduct('non-existent-id')).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });
  });

  // 사용자가 좋아요 누른 상품 조회
  describe('getUserLike', () => {
    it('사용자가 좋아요를 누른 상품 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockLikes = {
        productLikes: [
          { id: 'like-1', product: { id: 'product-1' } },
          { id: 'like-2', product: { id: 'product-2' } },
        ],
      };
      mockUserRepository.getUserLike.mockResolvedValue(mockLikes);

      // --- 실행 (Act) ---
      const result = await userService.getUserLike(userId);

      // --- 검증 (Assert) ---
      expect(mockUserRepository.getUserLike).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getUserLike).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockLikes.productLikes);
    });

    it('존재하지 않는 사용자 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockUserRepository.getUserLike.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(userService.getUserLike('non-existent-id')).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });
  });
});
