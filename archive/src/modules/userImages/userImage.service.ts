import { UserImageRepository } from './userImage.repository.js';
import type { Prisma } from '@prisma/client';
import type { CreateUserImageBody } from './userImage.dto.js';

export class UserImageService {
  constructor(private userImageRepository: UserImageRepository) {}

  // 사용자 사진 생성 (업로드)
  public createUserImage = async (data: CreateUserImageBody) => {
    const { publicId, fileUrl } = data;

    const createData: Prisma.UserImageCreateInput = {
      publicId,
      fileUrl,
    };

    const userImage = await this.userImageRepository.createUserImage(createData);

    return userImage;
  };
}
