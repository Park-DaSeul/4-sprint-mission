import type { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import Busboy from 'busboy';
import { BadRequestError, InternalServerError, PayloadTooLargeError } from '../utils/errorClass.js';

export interface UploadRequest extends Request {
  cloudinaryResult?: {
    public_id: string;
    secure_url: string;
  };
}

// 스트리밍 업로드 미들웨어 팩토리 함수: 폴더명을 인수로 받습니다.
export const cloudinaryUploader = (option: UploadApiOptions) => {
  // 실제 미들웨어 함수
  return (req: UploadRequest, res: Response, next: NextFunction) => {
    // 10MB 제한
    const fileLimit = 10 * 1024 * 1024;
    const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Busboy 인스턴스 생성
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: fileLimit,
      },
    });

    // 파일이 요청에 포함되어 있는지 추적
    let fileFound = false;
    // 업로드 완료 여부 추적
    let uploadCompleted = false;

    // 'file' 이벤트 리스너: 파일 스트림이 도착했을 때 처리
    busboy.on('file', (_fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      fileFound = true;

      // 파일 형식 검증
      if (!allowedImageMimeTypes.includes(mimeType)) {
        // 파일을 Cloudinary로 보내지 않고 스트림을 무시
        fileStream.resume();

        // 이미 에러 응답을 보냈다면 추가 응답 방지
        if (res.headersSent) return;

        busboy.removeAllListeners('file');
        busboy.removeAllListeners('finish');
        busboy.removeAllListeners('filesLimit');
        req.unpipe(busboy);

        return next(
          new BadRequestError('업로드할 수 없는 파일 형식입니다. JPEG, PNG, GIF, WebP 이미지 파일만 가능합니다.'),
        );
      }

      const publicId = `${Date.now()}-${filename}`;
      const finalOption: UploadApiOptions = { ...option, public_id: publicId };

      // Cloudinary 업로드 스트림 생성
      const uploadStream = cloudinary.uploader.upload_stream(finalOption, (error, result) => {
        // 업로드 완료 (성공/실패 무관)
        uploadCompleted = true;

        // 업로드 완료 후 콜백 함수 (실패)
        if (error) {
          // 이미 다른 에러로 응답이 전송되었는지 확인
          if (!res.headersSent) {
            return next(new InternalServerError('파일 업로드 중 클라우드 오류가 발생했습니다.'));
          }
        }

        // 업로드 완료 후 콜백 함수 (성공)
        if (result && !res.headersSent) {
          // 성공 정보를 Request 객체에 저장
          req.cloudinaryResult = {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };

          busboy.removeAllListeners('finish');
          next();
        }
      });

      // 클라이언트 파일 스트림을 Cloudinary 스트림에 연결
      // 서버 메모리에 데이터 저장 없음
      fileStream.pipe(uploadStream);
    });

    // 'filesLimit' 이벤트 리스너: 파일 크기 제한 초과 처리
    busboy.on('filesLimit', () => {
      if (res.headersSent) return;

      // 클라이언트 연결을 끊고 에러 응답
      req.unpipe(busboy);
      busboy.removeAllListeners();
      return next(new PayloadTooLargeError(`파일 크기가 제한(${fileLimit / (1024 * 1024)}MB)을 초과했습니다.`));
    });

    // 'finish' 이벤트 리스너: 파일이 아예 없는 요청 처리
    busboy.on('finish', () => {
      if (!fileFound && !res.headersSent && !uploadCompleted) {
        return next(new BadRequestError('업로드할 파일이 없습니다.'));
      }
    });
    // 'error' 이벤트 리스너: Busboy 자체 에러 처리
    busboy.on('error', (err) => {
      console.error('Busboy Error:', err);
      if (!res.headersSent) {
        return next(new InternalServerError('요청 처리 중 오류가 발생했습니다.'));
      }
    });

    // 요청 스트림을 Busboy에 연결
    req.pipe(busboy);
  };
};
