import type { Prisma, PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  // 회원가입
  public signup = async (createData: Prisma.UserCreateInput) => {
    const user = await this.prisma.user.create({
      data: createData,
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  };

  // 이메일 중복 확인
  public checkUserExistsByEmail = async (email: string) => {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  };
}
