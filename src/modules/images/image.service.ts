import type { CreateImageBody } from './image.dto.js';
import { getUploadPresignedUrl } from '../../lib/s3-service.js';

export class ImageService {
  public createImage = async (data: CreateImageBody) => {
    const { filename, contentType } = data;

    const image = await getUploadPresignedUrl(filename, contentType);

    return image;
  };
}
