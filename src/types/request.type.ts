import type { Request } from 'express';
import type { User } from '@prisma/client';

// ----------------------------------------------------
// 인증 (Auth)
// ----------------------------------------------------

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface OptionalAuthRequest extends Request {
  user?: User;
}

// ----------------------------------------------------
// 인가 (Ownership)
// ----------------------------------------------------

export interface OwnershipRequest extends Request {
  user: { id: string };
  parsedParams: { id: string };
  resource?: Record<string, any>;
}

export interface ResourceExistsRequest<P extends string> extends Request {
  parsedParams: Record<P, string>;
}

// ----------------------------------------------------
// 유효성 검사 (Validate)
// ----------------------------------------------------

export interface ParsedParamsWithRequest<P> extends Request {
  parsedParams: P;
}

export interface ParsedQueryParamsWithRequest<Q> extends Request {
  parsedQuery: Q;
}

export interface ParsedBodyParamsWithRequest<B> extends Request {
  parsedBody: B;
}

// ----------------------------------------------------
// 파일 업로드 (Cloudinary)
// ----------------------------------------------------

export interface UploadRequest extends Request {
  cloudinaryResult?: {
    public_id: string;
    secure_url: string;
  };
}
