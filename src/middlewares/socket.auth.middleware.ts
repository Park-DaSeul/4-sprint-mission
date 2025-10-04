import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import type { Socket } from 'socket.io';
import { JWT_ACCESS_TOKEN_SECRET } from '../lib/constants.js';
import type { User } from '@prisma/client';
import { UnauthorizedError } from '../utils/errorClass.js';

export interface AuthenticatedSocket extends Socket {
  user: User;
}
interface JwtPayload {
  sub: string;
}

export const socketAuthenticate = async (socket: Socket, next: (err?: Error) => void) => {
  // 클라이언트에서 auth.token 으로 보낸 값을 받음
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new UnauthorizedError('인증 오류: 토큰이 제공되지 않았습니다.'));
  }

  try {
    // 토큰을 검증하고 디코딩
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as JwtPayload;

    // 디코딩된 payload에서 사용자 ID를 사용하여 데이터베이스에서 사용자 정보를 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return next(new UnauthorizedError('인증 오류: 사용자를 찾을 수 없습니다.'));
    }

    // 소켓 객체에 사용자 정보를 첨부
    (socket as AuthenticatedSocket).user = user;

    return next();
  } catch (err) {
    return next(err as Error);
  }
};
