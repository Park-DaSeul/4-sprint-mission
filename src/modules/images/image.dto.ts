import { z } from 'zod';
import type { AuthenticatedRequest } from '../../types/request.type.js';

// ----------
// |  TYPE  |
// ----------

// 사진 생성 (업로드)
export interface CreateImageRequest extends AuthenticatedRequest {
  parsedBody: CreateImageBody;
}

// --------------------
// |  ZOD SCHEMAS     |
// --------------------

// image
export const filenameSchema = z
  .string()
  .min(1, '파일 이름은 최소 1글자 이상이어야 합니다.')
  .max(255, '파일 이름은 최대 255글자까지 가능합니다.');
export const contentTypeSchema = z
  .string()
  .regex(/^image\/(jpeg|png|gif|webp|svg|bmp)$/, '유효한 이미지 Content-Type이 아닙니다.');

// 사진 생성 (업로드)
export const createImage = z
  .object({
    filename: filenameSchema,
    contentType: contentTypeSchema,
  })
  .strict();

export type CreateImageBody = z.infer<typeof createImage>;
