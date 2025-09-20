import type { RequestHandler, Request, Response, NextFunction } from 'express';

export const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
