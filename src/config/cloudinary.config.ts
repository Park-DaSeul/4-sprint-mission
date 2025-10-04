import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  // --- Cloudinary 환경 변수 검증 및 설정 ---
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  // 필수 변수가 하나라도 누락되면 런타임 에러 발생
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary 환경 변수가 누락되었습니다.');
  }

  // Cloudinary 환경 설정
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
};
