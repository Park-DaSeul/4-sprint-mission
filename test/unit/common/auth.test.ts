import bcrypt from 'bcrypt';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { hashPassword, tokensAndSetCookies, verifyPassword } from '../../../src/common/auth.js';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../../src/lib/constants.js';
import { config } from '../../../src/config/config.js';

// bcrypt 모듈 모킹
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

const mockBcryptCompare = bcrypt.compare as Mock;
const mockBcryptHash = bcrypt.hash as Mock;

describe('Auth 유닛 테스트', () => {
  const plainPassword = 'password123';
  const hashedPassword = 'hashedPassword';
  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
  });

  // 비밀번호 확인
  describe('verifyPassword', () => {
    it('비밀번호가 일치하면 정상적으로 통과해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockBcryptCompare.mockResolvedValue(true);

      // --- 실행 (Act) ---
      await verifyPassword(plainPassword, hashedPassword);

      // --- 검증 (Assert) ---
      expect(mockBcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('비밀번호가 일치하지 않으면 에러를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockBcryptCompare.mockResolvedValue(false);

      // --- 실행 (Act) & 검증 (Assert) ---
      await expect(verifyPassword(plainPassword, hashedPassword)).rejects.toThrow('비밀번호가 일치하지 않습니다.');
      expect(mockBcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });
  });

  // 비밀번호 해시 처리 테스트
  describe('hashPassword', () => {
    it('비밀번호를 성공적으로 해시 처리해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockBcryptHash.mockResolvedValue(hashedPassword);

      // --- 실행 (Act) ---
      const result = await hashPassword(plainPassword);

      // --- 검증 (Assert) ---
      expect(result).toBe(hashedPassword);
      expect(mockBcryptHash).toHaveBeenCalledWith(plainPassword, 10);
    });
  });

  // https로 배포 할때 설정
  // 토큰 발급 및 쿠키 설정 테스트
  describe('tokensAndSetCookies', () => {
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    const res: any = {
      cookie: vi.fn(),
    };

    // https 설정 가능 할때 테스트 on
    // it('production 환경에서 secure 쿠키를 설정해야 한다.', () => {
    //   // --- 준비 (Arrange) ---
    //   config.NODE_ENV = 'production';

    //   // --- 실행 (Act) ---
    //   tokensAndSetCookies(res, accessToken, refreshToken);

    //   // --- 검증 (Assert) ---
    //   expect(res.cookie).toHaveBeenCalledTimes(2);

    //   // Access Token 쿠키 검증
    //   expect(res.cookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'lax',
    //     maxAge: 1 * 60 * 60 * 1000, // 1시간
    //   });

    //   // Refresh Token 쿠키 검증
    //   expect(res.cookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'lax',
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    //     path: '/auth/refresh',
    //   });
    // });

    it('development 환경에서 secure: false로 쿠키를 설정해야 한다.', () => {
      // --- 준비 (Arrange) ---
      config.NODE_ENV = 'development';

      // --- 실행 (Act) ---
      tokensAndSetCookies(res, accessToken, refreshToken);

      // --- 검증 (Assert) ---
      expect(res.cookie).toHaveBeenCalledTimes(2);

      // Access Token 쿠키 검증
      expect(res.cookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1 * 60 * 60 * 1000, // 1시간
      });

      // Refresh Token 쿠키 검증
      expect(res.cookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        path: '/auth/refresh',
      });
    });
  });
});
