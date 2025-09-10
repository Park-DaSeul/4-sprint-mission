import { Strategy as JwtStrategy } from 'passport-jwt';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import prisma from '../prisma.js';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from '../constants.js';

interface JwtPayload {
  sub: string;
}

type DoneCallback = (error: Error | null, user: User | false, info?: object) => void;

const accessTokenOptions = {
  jwtFromRequest: (req: Request) => req.cookies[ACCESS_TOKEN_COOKIE_NAME],
  secretOrKey: JWT_ACCESS_TOKEN_SECRET,
};

const refreshTokenOptions = {
  jwtFromRequest: (req: Request) => req.cookies[REFRESH_TOKEN_COOKIE_NAME],
  secretOrKey: JWT_REFRESH_TOKEN_SECRET,
};

const jwtVerify = async (payload: JwtPayload, done: DoneCallback) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'), false);
  }
};

export const accessTokenStrategy = new JwtStrategy(accessTokenOptions, jwtVerify);
export const refreshTokenStrategy = new JwtStrategy(refreshTokenOptions, jwtVerify);
