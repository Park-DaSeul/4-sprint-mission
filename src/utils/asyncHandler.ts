import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = <TReq extends Request>(
  requestHandler: (req: TReq, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await requestHandler(req as TReq, res, next);
    } catch (error) {
      next(error);
    }
  };
};
