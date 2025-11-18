import { S3Client } from '@aws-sdk/client-s3';
import { config } from './config.js';

export const s3Config = {
  bucketName: config.AWS_S3_BUCKET_NAME,
  region: config.AWS_S3_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
};

// 파일이 import 되는 순간 딱 한 번 생성 (싱글톤 효과)
export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

// export let s3Client: S3Client;

// export const configureS3 = () => {
//   s3Client = new S3Client({
//     region: s3Config.region,
//     credentials: {
//       accessKeyId: s3Config.accessKeyId,
//       secretAccessKey: s3Config.secretAccessKey,
//     },
//   });
// };
