import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import type { Socket } from 'socket.io';
import { config } from '../config/config.js';
import { UnauthorizedError } from '../utils/errorClass.js';

export const socketAuthenticate = async (socket: Socket, next: (err?: Error) => void) => {
  // 클라이언트에서 auth.token 으로 보낸 값을 받음
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new UnauthorizedError('인증 오류: 토큰이 제공되지 않았습니다.'));
  }

  try {
    // 토큰을 검증하고 디코딩
    const decoded = jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);

    if (typeof decoded.sub !== 'string') {
      return next(new UnauthorizedError('인증 오류: 토큰의 Subject(ID)가 유효하지 않습니다.'));
    }

    // 디코딩된 payload에서 사용자 ID를 사용하여 데이터베이스에서 사용자 정보를 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return next(new UnauthorizedError('인증 오류: 사용자를 찾을 수 없습니다.'));
    }

    // 소켓 객체에 사용자 정보를 첨부
    socket.user = user;

    return next();
  } catch (err) {
    return next(err as Error);
  }
};
