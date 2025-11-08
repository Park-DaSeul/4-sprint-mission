import type { CorsOptions } from 'cors';
import { config } from './config.js';
import { ForbiddenError } from '../utils/errorClass.js';

let allowedOrigins: string[];

switch (config.NODE_ENV) {
  case 'production':
    // --- 프로덕션 환경 ---
    // CORS_ORIGIN 환경 변수 설정이 필수
    if (!config.CORS_ORIGIN) {
      throw new ForbiddenError('프로덕션 환경에서는 CORS_ORIGIN 환경 변수를 반드시 설정해야 합니다.');
    }
    allowedOrigins = config.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    break;

  case 'test':
  case 'development':
  default:
    // --- 개발 및 테스트 환경 ---
    // 환경 변수가 있으면 사용하고, 없으면 기본값(localhost)을 사용
    allowedOrigins = config.CORS_ORIGIN
      ? config.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000', 'http://localhost:5173'];
    break;
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // origin이 없거나 (예: Postman), 허용된 목록에 있는 경우
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // 허용되지 않는 출처인 경우
    callback(new ForbiddenError('CORS 정책에 의해 허용되지 않는 출처입니다.'));
  },
  credentials: true,
};
