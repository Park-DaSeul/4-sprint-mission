export const validate = (schemas) => (req, res, next) => {
  const validationResult = {};

  try {
    if (schemas.body) {
      const { success, data, error } = schemas.body.safeParse(req.body);
      if (!success) {
        return next(error);
      }
      validationResult.body = data;
    }

    if (schemas.query) {
      const { success, data, error } = schemas.query.safeParse(req.query);
      if (!success) {
        return next(error);
      }
      validationResult.query = data;
    }

    if (schemas.params) {
      const { success, data, error } = schemas.params.safeParse(req.params);
      if (!success) {
        return next(error);
      }
      validationResult.params = data;
    }

    // 유효성 검사를 통과한 데이터를 새로운 속성에 저장
    req.validatedData = validationResult;

    next();
  } catch (err) {
    next(err); // 예상 못한 에러도 전역 핸들러로 넘김
  }
};
