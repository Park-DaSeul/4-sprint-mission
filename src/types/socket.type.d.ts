import { Socket } from 'socket.io';
import type { User } from '@prisma/client';

type AuthenticatedSocket = Pick<User, 'id' | 'email' | 'nickname'>;

declare module 'socket.io' {
  interface Socket {
    user?: AuthenticatedSocket;
  }
}
