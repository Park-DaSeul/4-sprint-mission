import { vi, Mock } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../src/utils/errorClass.js';
import {
  authenticate,
  optionalAuthenticate,
  localAuthenticate,
  refreshTokenAuthenticate,
} from '../../../src/middlewares/auth.middleware.js';
import type { User } from '@prisma/client';

// 테스트 케이스에서 원하는 인증 결과를 주입하기 위한 변수
let mockAuthResult: { err: Error | null; user: User | false; info: object | null };

const { passportAuthenticateSpy } = vi.hoisted(() => {
  const mockAuthenticateImplementation = (
    _strategy: string,
    _options: object,
    callback?: (err: Error | null, user: User | false, info: object | null) => void,
  ) => {
    return (_req: Request, _res: Response, _next: NextFunction) => {
      if (!callback) {
        return _next();
      }

      callback(mockAuthResult.err, mockAuthResult.user, mockAuthResult.info);
    };
  };

  return {
    passportAuthenticateSpy: vi.fn(mockAuthenticateImplementation),
  };
});

// passport.authenticate 모듈 모킹
vi.mock('../../../src/lib/passport/index.js', () => {
  return {
    default: {
      authenticate: passportAuthenticateSpy,
    },
  };
});

describe('Auth Middleware 유닛 테스트', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction & Mock;

  const user = {
    id: 'user-id',
    email: 'test@test.com',
    nickname: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    mockRequest = {} as unknown as Request;
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = vi.fn();
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('유효한 토큰이 있을 경우 req.user에 유저 정보를 설정하고 next를 호출해야 한다.', () => {
      // --- 준비 (Arrange) ---
      mockAuthResult = { err: null, user: user, info: null };

      // --- 실행 (Act) ---
      authenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(passportAuthenticateSpy).toHaveBeenCalledWith('access-token', { session: false }, expect.any(Function));
      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('유효하지 않은 토큰일 경우 UnauthorizedError를 호출해야 한다.', () => {
      // --- 준비 (Arrange) ---
      mockAuthResult = { err: null, user: false, info: {} };

      // --- 실행 (Act) ---
      authenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('인증이 필요합니다.');
    });

    it('인증 중 에러가 발생하면 next에 에러를 전달해야 한다.', () => {
      // --- 준비 (Arrange) ---
      const mockError = new Error('Database connection failed');
      mockAuthResult = { err: mockError, user: false, info: {} };

      // --- 실행 (Act) ---
      authenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('optionalAuthenticate', () => {
    it('유효한 토큰이 있을 경우 req.user에 유저 정보를 설정하고 next를 호출해야 한다.', () => {
      // --- 준비 (Arrange) ---
      mockAuthResult = { err: null, user: user, info: null };

      // --- 실행 (Act) ---
      optionalAuthenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('유효하지 않은 토큰일 경우 req.user를 설정하지 않고 next를 호출해야 한다.', () => {
      // --- 준비 (Arrange) ---
      mockAuthResult = { err: null, user: false, info: {} };
      // --- 실행 (Act) ---
      optionalAuthenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('인증 중 에러가 발생하면 next에 에러를 전달해야 한다.', () => {
      // --- 준비 (Arrange) ---
      const mockError = new Error('Token verification failed');
      mockAuthResult = { err: mockError, user: false, info: {} };

      // --- 실행 (Act) ---
      optionalAuthenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('localAuthenticate', () => {
    it('passport.authenticate가 local 전략으로 호출해야 한다.', () => {
      // --- 실행 (Act) ---
      localAuthenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(passportAuthenticateSpy).toHaveBeenCalledWith('local', { session: false });
    });
  });

  describe('refreshTokenAuthenticate', () => {
    it('passport.authenticate가 refresh-token 전략으로 호출해야 한다.', () => {
      // --- 실행 (Act) ---
      refreshTokenAuthenticate(mockRequest, mockResponse, mockNext);

      // --- 검증 (Assert) ---
      expect(passportAuthenticateSpy).toHaveBeenCalledWith('refresh-token', { session: false });
    });
  });
});
