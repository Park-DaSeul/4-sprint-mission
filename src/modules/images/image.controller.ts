import { ImageService } from './image.service.js';
import type { Response } from 'express';
import type { CreateImageRequest } from './image.dto.js';

export class ImageController {
  constructor(private imageService: ImageService) {}

  // 사진 생성 (업로드)
  public createImage = async (req: CreateImageRequest, res: Response) => {
    const data = req.parsedBody;

    const image = await this.imageService.createImage(data);

    return res.status(200).json({ success: true, data: image });
  };
}
