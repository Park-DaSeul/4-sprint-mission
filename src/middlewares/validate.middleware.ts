import type { Request, Response, NextFunction } from 'express';
import type { ZodObject } from 'zod';

export const validate = (schema: ZodObject<any, any>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedData = schema.parse(req);

      next();
    } catch (err) {
      next(err); // 예상 못한 에러도 전역 핸들러로 넘김
    }
  };
};
