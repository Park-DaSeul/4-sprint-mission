import './env.config.js';

// 환경 변수를 가져오거나, 없으면 에러를 던지는 함수
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} 환경 변수가 설정되지 않았습니다.`);
  }
  return value;
};

// 모든 환경변수
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN,

  // JWT
  JWT_ACCESS_TOKEN_SECRET: getEnvVariable('JWT_ACCESS_TOKEN_SECRET'),
  JWT_REFRESH_TOKEN_SECRET: getEnvVariable('JWT_REFRESH_TOKEN_SECRET'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVariable('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVariable('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVariable('CLOUDINARY_API_SECRET'),

  // AWS S3
  AWS_S3_BUCKET_NAME: getEnvVariable('AWS_S3_BUCKET_NAME'),
  AWS_S3_REGION: getEnvVariable('AWS_S3_REGION'),
  AWS_ACCESS_KEY_ID: getEnvVariable('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getEnvVariable('AWS_SECRET_ACCESS_KEY'),
};
