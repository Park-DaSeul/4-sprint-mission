import type { Prisma, PrismaClient } from '@prisma/client';

export class UserImageRepository {
  constructor(private prisma: PrismaClient) {}

  // 사용자 사진 생성 (업로드)
  public createUserImage = async (createData: Prisma.UserImageCreateInput) => {
    const userImage = await this.prisma.userImage.create({
      data: createData,
      select: { id: true },
    });

    return userImage;
  };
}
