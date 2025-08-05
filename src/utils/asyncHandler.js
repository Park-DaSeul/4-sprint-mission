import { Prisma } from '@prisma/client';
//에러 핸들러 입니다.
function asyncHandler(handler) {
  return async function (req, res, next) {
    try {
      await handler(req, res, next);
    } catch (e) {
      console.error('AsyncHandler caught an error:', e);
      if (
        e.name === 'StructError' ||
        e instanceof Prisma.PrismaClientValidationError //유효성 검사 에러 유형에 속하는지
      ) {
        return res
          .status(400)
          .json({ message: e.message || '잘못 요청된 데이터입니다.' });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError && //예측 가능한 에러인지 확인
        e.code === 'P2025'
      ) {
        return res
          .status(404)
          .json({ message: '요청한 리소스를 찾을 수 없습니다.' });
      }
      next(e); //그 외의 에러는 다음 에러 핸들링 미들웨어로 전달
    }
  };
}

export default asyncHandler;
