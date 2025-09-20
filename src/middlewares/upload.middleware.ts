import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// 파일 타입과 해당 파일이 저장될 경로를 매핑합니다.
const uploadPaths: Record<string, string> = {
  products: 'uploads/products',
  articles: 'uploads/articles',
  users: 'uploads/users',
};

// 주어진 경로에 디렉토리가 없으면 생성하는 함수
const createDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage 설정을 생성하는 함수
const createStorage = (destination: string) => {
  createDirectory(destination); // 디렉토리 생성
  return multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      cb(null, destination);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      // 파일명 중복을 피하기 위해 현재 시간을 앞에 추가
      cb(null, `${Date.now()}-${basename}${ext}`);
    },
  });
};

// 파일 필터 함수 (이미지 파일만 허용)
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    // 허용되지 않는 경우, 즉시 에러 콜백을 호출하고 함수를 종료
    return cb(new Error('지원되지 않는 파일 형식입니다.'));
  }
  // 허용된 경우, 아래 코드가 실행됨
  cb(null, true);
};

// 업로드 타입에 대한 타입 별칭 정의
type UploadType = 'products' | 'articles' | 'users';

// 업로드 유형에 따라 Multer 인스턴스를 생성하는 함수
const createUploader = (type: UploadType) => {
  const destination = uploadPaths[type];

  if (destination === undefined) throw new Error('지원되지 않는 업로드 타입입니다.');

  return multer({
    storage: createStorage(destination),
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 사이즈 제한
  });
};

// 각 용도에 맞는 미들웨어 인스턴스를 생성하여 내보냅니다.
export const productImageUpload = createUploader('products').single('image');
export const articleImageUpload = createUploader('articles').single('image');
export const userImageUpload = createUploader('users').single('image');

// 여러 이미지 업로드가 필요한 경우 (예: .array('images', 5))
// export const productImagesUpload = createUploader('products').array('images', 5);
