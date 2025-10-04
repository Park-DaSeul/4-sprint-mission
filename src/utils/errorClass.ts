export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'HttpError';

    Error.captureStackTrace(this, this.constructor);
  }
}

// BadRequest 에러 클래스 (400 Bad Request)
// 잘못된 요청 데이터나 Zod 유효성 검사 실패 시 사용
export class BadRequestError extends HttpError {
  constructor(message: string = '잘못된 요청 데이터입니다.') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

// Unauthorized 에러 클래스 (401 Unauthorized)
// 토큰이 없거나 유효하지 않을 때 or 인증(로그인) 실패 시 사용.
export class UnauthorizedError extends HttpError {
  constructor(message: string = '인증 정보가 유효하지 않습니다.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

// Forbidden 에러 클래스 (403 Forbidden)
// 인증은 되었으나 접근 권한이 없을 때 or 인가(권한) 부족 시 사용.
export class ForbiddenError extends HttpError {
  constructor(message: string = '이 리소스에 접근할 권한이 없습니다.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

// NotFound 에러 클래스 (404 Not Found)
export class NotFoundError extends HttpError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

// PayloadTooLarge 에러 클래스 (413 Payload Too Large)
// 업로드 할때 허용 용량을 초과 할때  사용.
export class PayloadTooLargeError extends HttpError {
  constructor(message: string = '요청 페이로드가 너무 큽니다.') {
    super(413, message);
    this.name = 'PayloadTooLargeError';
  }
}

// Conflict 에러 클래스 (409 Conflict)
// 이미 존재하는 리소스를 생성하려 할 때(예: 중복된 이메일) 사용.
export class ConflictError extends HttpError {
  constructor(message: string = '이미 존재하는 리소스입니다.') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

// InternalServerError 에러 클래스 (500 Internal Server Error)
// 코드 버그 등 예상치 못한 에러를 명시적으로 던질 때 사용.
export class InternalServerError extends HttpError {
  constructor(message: string = '서버 내부 오류가 발생했습니다.') {
    super(500, message, false);
    this.name = 'InternalServerError';
  }
}

// NotImplementedError 에러 클래스 (501 Not Implemented)
// 클라이언트가 요청한 기능이 서버에 구현되어 있지 않을 때 사용.
export class NotImplementedError extends HttpError {
  constructor(message: string = '요청하신 기능은 아직 구현되지 않았습니다.') {
    super(501, message);
    this.name = 'NotImplementedError';
  }
}
