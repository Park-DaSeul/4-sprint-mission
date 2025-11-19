import { AuthService } from '../../../src/modules/auth/auth.service.js';
import { AuthRepository } from '../../../src/modules/auth/auth.repository.js';
import * as common from '../../../src/common/index.js';
import * as token from '../../../src/lib/token.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockAuthRepository = {
  signup: vi.fn(),
  checkUserExistsByEmail: vi.fn(),
};

describe('AuthService 유닛 테스트', () => {
  let authService: AuthService;

  const userId = 'user-id-1';
  const hashedPassword = 'hashedPassword';
  const user = {
    id: userId,
    nickname: 'testuser',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    authService = new AuthService(mockAuthRepository as unknown as AuthRepository);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 회원가입
  describe('signUp', () => {
    it('회원가입에 성공해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        nickname: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };
      const mockCreatedUser = {
        id: userId,
        ...data,
      };

      mockAuthRepository.checkUserExistsByEmail.mockResolvedValue(null);
      const hashSpy = vi.spyOn(common, 'hashPassword').mockResolvedValue(hashedPassword);
      mockAuthRepository.signup.mockResolvedValue(mockCreatedUser);

      // --- 실행 (Act) ---
      const result = await authService.signup(data);

      const createData = {
        nickname: data.nickname,
        email: data.email,
        password: hashedPassword,
      };

      // --- 검증 (Assert) ---
      expect(mockAuthRepository.checkUserExistsByEmail).toHaveBeenCalledWith(data.email);
      expect(hashSpy).toHaveBeenCalledWith(data.password);
      expect(mockAuthRepository.signup).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.signup).toHaveBeenCalledWith(createData);
      expect(result).toBe(mockCreatedUser);
    });

    it('이미 존재하는 이메일일 경우 ConflictError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        nickname: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };
      mockAuthRepository.checkUserExistsByEmail.mockResolvedValue(user);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(authService.signup(data)).rejects.toThrow('이미 사용 중인 이메일입니다.');
    });
  });

  // 로그인
  describe('login', () => {
    it('로그인에 성공하고 토큰을 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const loginToken = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      const tokenSpy = vi.spyOn(token, 'generateTokens').mockReturnValue(loginToken);

      // --- 실행 (Act) ---
      const result = authService.login(userId);

      // --- 검증 (Assert) ---
      expect(tokenSpy).toHaveBeenCalledWith(userId);
      expect(result).toEqual(loginToken);
    });
  });

  // 토큰 재발급
  describe('refresh', () => {
    it('새로운 토큰을 재발급해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const refreshToken = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      const tokenSpy = vi.spyOn(token, 'generateTokens').mockReturnValue(refreshToken);

      // --- 실행 (Act) ---
      const result = authService.refresh(userId);

      // --- 검증 (Assert) ---
      expect(tokenSpy).toHaveBeenCalledWith(userId);
      expect(result).toEqual(refreshToken);
    });
  });
});
