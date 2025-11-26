import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Config, s3Client } from '../config/s3.config.js';

// S3에 파일을 업로드하기 위한 사전 서명된(presigned) URL을 생성하는 함수
export const getUploadPresignedUrl = async (filename: string, contentType: string) => {
  // 파일 이름 생성 (임시 폴더에 저장)
  const uniqueFilename = `temp/${Date.now()}-${filename}`;
  // 최대 파일 용량 10MB
  const maxFileSize = 10 * 1024 * 1024;
  // 제한시간 300초 (5분)
  const expires = 300;

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: s3Config.bucketName,
    Key: uniqueFilename,
    Conditions: [
      ['content-length-range', 0, maxFileSize],
      ['starts-with', '$Content-Type', contentType],
    ],
    Fields: {
      'Content-Type': contentType,
    },
    Expires: expires,
  });

  return {
    url,
    fields,
    key: uniqueFilename,
  };
};

// S3에 저장된 파일의 공개 접근 URL을 생성하는 함수
export const getFileUrl = (key: string) => {
  const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

  return fileUrl;
};

// S3 파일을 영구 스토리지로 이동하는 함수 (실제로는 복사 후 삭제)
export const moveFileToPermanent = async (tempKey: string, destinationFolder: 'articles' | 'users' | 'products') => {
  if (!tempKey.startsWith('temp/')) {
    throw new Error('유효하지 않은 임시 파일 키입니다.');
  }

  const permanentKey = tempKey.replace('temp/', `${destinationFolder}/`);

  // 임시 파일을 영구 위치로 복사
  const copyCommand = new CopyObjectCommand({
    Bucket: s3Config.bucketName,
    CopySource: `${s3Config.bucketName}/${tempKey}`,
    Key: permanentKey,
  });
  await s3Client.send(copyCommand);

  // 임시 파일 삭제
  const deleteCommand = new DeleteObjectCommand({
    Bucket: s3Config.bucketName,
    Key: tempKey,
  });
  await s3Client.send(deleteCommand);

  return permanentKey;
};

// S3에서 파일을 삭제하는 함수
export const deleteFileFromS3 = async (key: string) => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });
  return await s3Client.send(deleteCommand);
};
