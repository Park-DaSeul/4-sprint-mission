import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '../utils/errorClass.js';
import type { OwnershipRequest, ResourceExistsRequest } from '../types/request.type.js';

interface PrismaDelegate {
  findUnique: (args: { where: { id: string }; include?: object }) => Promise<any>;
}

// 인가 확인 미들웨어
export const checkOwnership =
  (delegate: PrismaDelegate, userFieldName = 'userId', include?: object) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const typedReq = req as OwnershipRequest;

      const resourceId = typedReq.parsedParams?.id;
      const userId = typedReq.user?.id;

      const resource = await delegate.findUnique({
        where: { id: resourceId },
        ...(include && { include }),
      });

      if (!resource) {
        return next(new NotFoundError(`요청하신 리소스를 찾을 수 없습니다.`));
      }

      if (resource[userFieldName] !== userId) {
        return next(new ForbiddenError('이 작업을 수행할 권한이 없습니다.'));
      }

      typedReq.resource = resource;

      return next();
    } catch (err) {
      return next(err);
    }
  };

// 리소스의 존재 여부만 확인하는 미들웨어
export const checkResourceExists =
  <P extends string>(delegate: PrismaDelegate, paramId: P) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const typedReq = req as ResourceExistsRequest<P>;

      const resourceId = typedReq.parsedParams?.[paramId];

      const resource = await delegate.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return next(new NotFoundError(`요청하신 리소스를 찾을 수 없습니다.`));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
