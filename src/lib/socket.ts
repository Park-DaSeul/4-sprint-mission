import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthenticate } from '../middlewares/socket.auth.middleware.js';
import type { AuthenticatedSocket } from '../middlewares/socket.auth.middleware.js';
import { corsOptions } from '../config/cors.config.js';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    // cors 설정
    cors: corsOptions,
  });

  // --- 로그인 인증 필요 ---
  io.use(socketAuthenticate);

  io.on('connection', (socket: Socket) => {
    console.log('사용자가 성공적으로 인증 및 연결되었습니다.');

    // 미들웨어에서 검증하고 첨부한 사용자 ID를 사용
    const userId = (socket as AuthenticatedSocket).user.id;

    // 사용자를 자신의 ID와 동일한 이름의 방(room)에 참여
    socket.join(userId);
    console.log(`사용자 ${userId}가 전용 방에 참여했습니다.`);

    socket.on('disconnect', () => {
      console.log('사용자가 연결 해제되었습니다.');
    });
  });

  return io;
};

export const getSocketIo = () => {
  if (!io) {
    throw new Error('Socket.io가 초기화되지 않았습니다!');
  }
  return io;
};
