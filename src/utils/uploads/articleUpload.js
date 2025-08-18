import multer from 'multer';
import path from 'path';

//파일 저장 위치, 이름 정하기
const articleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/articles'); //uploads/articles에 저장
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + path.basename(file.originalname, ext) + ext);
  }, //파일명 예시 1722838382737-fileName.jpg
});

//파일 유효성, 크기 검사
export const uploadArticleImage = multer({
  storage: articleStorage,
  limits: { fieldSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(
      new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF만 가능)'),
      false,
    );
  },
});
