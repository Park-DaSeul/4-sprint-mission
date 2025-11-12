import { UserRepository } from './user.repository.js';
import type { Prisma } from '@prisma/client';
import type { UpdateUserBody, DeleteUserBody } from './user.dto.js';
import type { User } from '@prisma/client';
import { verifyPassword, hashPassword } from '../../common/index.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  // 사용자 조회
  public getUser = async (id: string) => {
    const user = await this.userRepository.getUser(id);

    return user;
  };

  // 사용자 수정
  public updateUser = async (id: string, data: UpdateUserBody, resource: User) => {
    const { nickname, password, newPassword, imageId } = data;

    // 비밀번호 확인
    if (password) {
      await verifyPassword(password, resource.password);
    }

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.UserUpdateInput = {
      ...(nickname !== resource.nickname && { nickname }),
      ...(newPassword && { password: await hashPassword(newPassword) }),
      ...(imageId && {
        userImage: {
          connect: { id: imageId },
        },
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new Error('수정할 내용이 없습니다.');
    }

    const user = await this.userRepository.updateUser(id, updateData);

    return user;
  };

  // 사용자 삭제
  public deleteUser = async (id: string, data: DeleteUserBody, resource: User) => {
    const { password } = data;

    // 비밀번호 확인
    await verifyPassword(password, resource.password);

    return await this.userRepository.deleteUser(id);
  };

  // 사용자가 등록한 상품 조회
  public getUserProduct = async (id: string) => {
    const user = await this.userRepository.getUserProduct(id);

    const userData = user?.products ?? [];

    return userData;
  };

  // 사용자가 좋아요 누른 상품 조회
  public getUserLike = async (id: string) => {
    const user = await this.userRepository.getUserLike(id);

    const userData = user?.productLikes.map((productLike) => productLike.product) ?? [];

    return userData;
  };
}
