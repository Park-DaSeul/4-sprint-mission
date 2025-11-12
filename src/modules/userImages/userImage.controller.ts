import { UserImageService } from './userImage.service.js';
import type { Response } from 'express';
import type { CreateUserImageRequest } from './userImage.dto.js';
import { deleteImageFromCloudinary } from '../../lib/cloudinary-service.js';

export class UserImageController {
  constructor(private userImageService: UserImageService) {}

  // 사용자 사진 생성 (업로드)
  public createUserImage = async (req: CreateUserImageRequest, res: Response) => {
    if (!req.cloudinaryResult) {
      throw new Error('사진 업로드 정보가 필요합니다.');
    }

    const publicId = req.cloudinaryResult.public_id;
    const fileUrl = req.cloudinaryResult.secure_url;

    const data = { publicId, fileUrl };

    try {
      const userImage = await this.userImageService.createUserImage(data);
      return res.status(201).json(userImage);

      // DB 저장 실패 시 롤백 (Cloudinary 파일 삭제)
    } catch (dbError) {
      console.error('DB 저장 실패! Cloudinary 롤백을 시작합니다.', dbError);
      await deleteImageFromCloudinary(publicId);

      return res.status(500).json({ message: '사진 정보를 저장하는 데 실패했습니다.' });
    }
  };
}
