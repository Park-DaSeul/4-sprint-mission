import { Prisma } from '@prisma/client';
import { z } from 'zod';

// 에러 핸들러입니다.
function asyncHandler(handler) {
  return async function (req, res, next) {
    try {
      await handler(req, res, next);
    } catch (e) {
      console.error('AsyncHandler caught an error:', e);
      // Zod 유효성 검사 오류 처리
      if (e instanceof z.ZodError) {
        return res.status(400).json({
          message: '유효성 검사 오류',
          errors: e.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025' // 존재하지 않는 리소스를 찾으려 할 때
      ) {
        return res
          .status(404)
          .json({ message: '요청한 리소스를 찾을 수 없습니다.' });
      }
      next(e); // 그 외의 에러는 다음 에러 핸들링 미들웨어로 전달
    }
  };
}

export default asyncHandler;
