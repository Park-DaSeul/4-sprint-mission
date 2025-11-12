import type { Request, RequestHandler } from 'express';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errorClass.js';

interface PrismaDelegate {
  findUnique: (args: { where: { id: string } }) => Promise<any>;
  model?: { name: string }; // 모델 이름에 접근하기 위해 추가 (에러 메시지용)
}

export interface OwnershipRequest extends Request {
  user: { id: string };
  parsedParams: { id: string };
}

export interface ResourceExistsRequest extends Request {
  parsedParams: Record<string, string>;
}

export type ResourceWithRequest<T> = OwnershipRequest & { resource: T };

// 인가 확인 미들웨어
export const checkOwnership = <T extends { userId: string } & Record<string, any>>(
  delegate: PrismaDelegate,
  userFieldName = 'userId',
): RequestHandler<any, any, any, any, OwnershipRequest> => {
  return async (req, _res, next) => {
    const typedReq = req as OwnershipRequest;

    const resourceId = typedReq.parsedParams.id;
    const userId = typedReq.user.id;

    if (!resourceId) {
      return next(new BadRequestError('리소스 ID가 필요합니다'));
    }

    try {
      const resource = await delegate.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        const modelName = delegate.model?.name || '리소스';
        return next(new NotFoundError(`${modelName}을/를 찾을 수 없습니다`));
      }

      if (resource[userFieldName] !== userId) {
        return next(new ForbiddenError('이 작업을 수행할 권한이 없습니다.'));
      }

      (req as ResourceWithRequest<T>).resource = resource;

      next();
    } catch (err) {
      next(err);
    }
  };
};

// 리소스의 존재 여부만 확인하는 미들웨어
export const checkResourceExists = (
  delegate: PrismaDelegate,
  paramId: string,
): RequestHandler<any, any, any, any, ResourceExistsRequest> => {
  return async (req, _res, next) => {
    try {
      const typedReq = req as ResourceExistsRequest;
      const resourceId = typedReq.parsedParams[paramId];

      if (!resourceId) {
        return next(new BadRequestError(`필수 리소스 '${paramId}' ID가 요청 경로에서 필요합니다.`));
      }

      const resource = await delegate.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        const modelName = delegate.model?.name || '리소스';
        return next(new NotFoundError(`${modelName}을/를 찾을 수 없습니다.`));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};
