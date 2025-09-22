import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

export const validate = <
  TParams extends ZodObject<ZodRawShape>,
  TQuery extends ZodObject<ZodRawShape>,
  TBody extends ZodObject<ZodRawShape>,
>(schemas: {
  body?: TBody;
  params?: TParams;
  query?: TQuery;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedData = {};

      if (schemas.body) {
        const { success, data, error } = schemas.body.safeParse(req.body);
        if (!success) {
          return next(error);
        }
        req.validatedData.body = data;
      }

      if (schemas.query) {
        const { success, data, error } = schemas.query.safeParse(req.query);
        if (!success) {
          return next(error);
        }
        req.validatedData.query = data;
      }

      if (schemas.params) {
        const { success, data, error } = schemas.params.safeParse(req.params);
        if (!success) {
          return next(error);
        }
        req.validatedData.params = data;
      }

      next();
    } catch (err) {
      next(err); // 예상 못한 에러도 전역 핸들러로 넘김
    }
  };
};
