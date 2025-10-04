import passport from '../lib/passport/index.js';
import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errorClass.js';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface OptionalAuthRequest extends Request {
  user?: User;
}

// 인증
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('access-token', { session: false }, (err: Error, user: User | false, _info: object) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new UnauthorizedError('인증이 필요합니다.'));
    }
    (req as AuthenticatedRequest).user = user;
    return next();
  })(req, res, next);
};

// 인증 optional
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('access-token', { session: false }, (err: Error, user: User | false, _info: object) => {
    if (err) {
      return next(err);
    }
    if (user) {
      (req as AuthenticatedRequest).user = user;
    }
    return next();
  })(req, res, next);
};

// 로그인
export const localAuthenticate = passport.authenticate('local', { session: false });

// 토큰 재발급
export const refreshTokenAuthenticate = passport.authenticate('refresh-token', { session: false });
