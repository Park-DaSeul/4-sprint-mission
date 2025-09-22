import type { Request, Response, NextFunction } from 'express';

export const jsonBodyParser = (req: Request, _res: Response, next: NextFunction) => {
  // 'data' 필드가 존재하는지 확인하고,
  // 있다면 JSON.parse를 통해 객체로 변환합니다.
  try {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    next();
  } catch (err) {
    next(err);
  }
};
