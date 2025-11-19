import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape, z } from 'zod';
import type {
  ParsedBodyParamsWithRequest,
  ParsedParamsWithRequest,
  ParsedQueryParamsWithRequest,
} from '../types/request.type.js';

// parmas
export const validateParams =
  <T extends ZodObject<ZodRawShape>>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.params);
      if (!success) {
        return next(error);
      }

      (req as ParsedParamsWithRequest<z.infer<T>>).parsedParams = data;
      return next();
    } catch (err) {
      return next(err);
    }
  };

// query
export const validateQuery =
  <T extends ZodObject<ZodRawShape>>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.query);
      if (!success) {
        return next(error);
      }

      (req as ParsedQueryParamsWithRequest<z.infer<T>>).parsedQuery = data;
      return next();
    } catch (err) {
      return next(err);
    }
  };

// body
export const validateBody =
  <T extends ZodObject<ZodRawShape>>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.body);
      if (!success) {
        return next(error);
      }

      (req as ParsedBodyParamsWithRequest<z.infer<T>>).parsedBody = data;
      return next();
    } catch (err) {
      return next(err);
    }
  };
