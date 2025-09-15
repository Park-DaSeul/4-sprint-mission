import type { Request, Response, NextFunction } from 'express';

export const resourceIdentifier = (req: Request, _res: Response, next: NextFunction) => {
  const { articleId, productId } = req.params;

  switch (true) {
    case !!articleId:
      req.resourceType = 'ARTICLE';
      req.resourceId = articleId;
      break;
    case !!productId:
      req.resourceType = 'PRODUCT';
      req.resourceId = productId;
      break;
    default:
  }

  next();
};
