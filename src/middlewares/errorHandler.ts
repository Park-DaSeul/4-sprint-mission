import { Prisma } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

//전역 에러핸들러
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err); // 모든 에러를 일단 로그로 남깁니다.

  // Zod 에러 처리
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Prisma 에러 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // 고유 제약 조건 실패 (e.g., 이미 존재하는 사용자 이름)
        return res.status(409).json({
          error: 'Conflict',
          message: `'${err.meta?.target}' 필드에 중복된 값이 존재합니다.`,
        });
      case 'P2025':
        // 필요한 레코드를 찾지 못함 (e.g., 존재하지 않는 게시글 수정 시도)
        return res.status(404).json({
          error: 'Not Found',
          message: '요청한 리소스를 찾을 수 없습니다.',
        });
      // 다른 Prisma 에러 코드에 대한 케이스를 추가할 수 있습니다.
      default:
        // 처리되지 않은 다른 Prisma 에러
        return res.status(500).json({
          error: 'Database Error',
          message: '데이터베이스 작업 중 오류가 발생했습니다.',
        });
    }
  }

  // 일반 에러 처리
  if (err instanceof Error) {
    const status = 'status' in err ? (err as { status: number }).status || 500 : 500;
    const errorName = err.name || 'Internal Server Error';
    const errorMessage = err.message || '서버에서 오류가 발생했습니다.';
    return res.status(status).json({
      error: errorName,
      message: errorMessage,
    });
  }

  // 알 수 없는 에러 처리
  return res.status(500).json({
    error: 'Internal Server Error',
    message: '서버에서 알 수 없는 오류가 발생했습니다.',
  });
};
