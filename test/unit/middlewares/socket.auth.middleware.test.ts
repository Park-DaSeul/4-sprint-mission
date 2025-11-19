import jwt from 'jsonwebtoken';
import { vi, Mock } from 'vitest';
import { socketAuthenticate } from '../../../src/middlewares/socket.auth.middleware.js';
import prisma from '../../../src/lib/prisma.js';
import { config } from '../../../src/config/config.js';
import { UnauthorizedError } from '../../../src/utils/errorClass.js';
import type { Socket } from 'socket.io';
import type { NextFunction } from 'express';

interface SocketWithUser extends Socket {
  user?: { id: string; email: string };
}

// 'jsonwebtoken'과 'prisma' 모듈을 모의(mock) 처리
vi.mock('jsonwebtoken');
vi.mock('../../../src/lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('socketAuthenticate Middleware 유닛 테스트', () => {
  let mockSocket: SocketWithUser;
  let mockNext: NextFunction & Mock;

  const userId = 'user-id-1';
  const user = {
    id: userId,
    email: 'test@example.com',
  };
  const token = 'valid-token';

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    mockSocket = {
      handshake: {
        auth: {},
      },
      user: null,
    } as unknown as SocketWithUser;

    mockNext = vi.fn();
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
  });

  // 인증 성공 시나리오
  describe('Success', () => {
    it('유효한 토큰으로 사용자를 성공적으로 인증해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockSocket.handshake.auth.token = token;
      vi.spyOn(jwt, 'verify').mockImplementation(() => ({ sub: userId }));
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      // --- 실행 (Act) ---
      await socketAuthenticate(mockSocket, mockNext);

      // --- 검증 (Assert) ---
      expect(jwt.verify).toHaveBeenCalledWith(token, config.JWT_ACCESS_TOKEN_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockSocket.user).toEqual(user);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  // 인증 실패 시나리오
  describe('Failure', () => {
    it('토큰이 제공되지 않으면 UnauthorizedError를 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockSocket.handshake.auth.token = undefined;

      // --- 실행 (Act) ---
      await socketAuthenticate(mockSocket, mockNext);

      // --- 검증 (Assert) ---
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('인증 오류: 토큰이 제공되지 않았습니다.');
    });

    it('유효하지 않은 토큰이 제공되면 에러를 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const jwtError = new Error('Invalid token');
      mockSocket.handshake.auth.token = 'invalid-token';
      vi.spyOn(jwt, 'verify').mockImplementation(() => {
        throw jwtError;
      });

      // --- 실행 (Act) ---
      await socketAuthenticate(mockSocket, mockNext);

      // --- 검증 (Assert) ---
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(jwtError);
    });

    it('토큰의 subject(ID)가 문자열이 아니면 UnauthorizedError를 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockSocket.handshake.auth.token = token;
      vi.spyOn(jwt, 'verify').mockImplementation(() => ({ sub: 123 }));

      // --- 실행 (Act) ---
      await socketAuthenticate(mockSocket, mockNext);

      // --- 검증 (Assert) ---
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('인증 오류: 토큰의 Subject(ID)가 유효하지 않습니다.');
    });

    it('토큰에 해당하는 사용자를 찾을 수 없으면 UnauthorizedError를 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockSocket.handshake.auth.token = token;
      vi.spyOn(jwt, 'verify').mockImplementation(() => ({ sub: userId }));
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // --- 실행 (Act) ---
      await socketAuthenticate(mockSocket, mockNext);

      // --- 검증 (Assert) ---
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('인증 오류: 사용자를 찾을 수 없습니다.');
    });
  });
});
