import passport from '../libs/passport/index.js';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('access-token', { session: false }, (err: Error, user: User | false, _info: object) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
