import type { CorsOptions } from 'cors';

const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN;

let allowedOrigins: string[];

if (NODE_ENV === 'production') {
  // --- 프로덕션 환경 ---
  // CORS_ORIGIN 환경 변수 설정 필수
  if (!CORS_ORIGIN) {
    throw new Error('프로덕션 환경에서는 CORS_ORIGIN 환경 변수를 반드시 설정해야 합니다.');
  }
  allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim());
} else {
  // --- 개발 환경 ---
  // 환경 변수가 있으면 사용하고, 없으면 기본값(localhost)을 사용
  allowedOrigins = CORS_ORIGIN
    ? CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 허용되지 않는 출처입니다.'));
    }
  },
  credentials: true,
};
