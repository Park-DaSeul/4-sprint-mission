import { UserRepository } from './user.repository.js';
import type { Prisma, User } from '@prisma/client';
import type { UpdateUserBody, DeleteUserBody } from './user.dto.js';
import { verifyPassword, hashPassword } from '../../common/index.js';
import { NotFoundError, BadRequestError } from '../../utils/errorClass.js';
import { getFileUrl, moveFileToPermanent } from '../../lib/s3-service.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  // 사용자 조회
  public getUser = async (id: string) => {
    const user = await this.userRepository.getUser(id);

    return user;
  };

  // 사용자 수정
  public updateUser = async (id: string, data: UpdateUserBody, resource: User) => {
    const { nickname, password, newPassword, imageKey } = data;

    let imageData: { key: string; fileUrl: string } | undefined = undefined;

    // 비밀번호 확인
    if (password) {
      await verifyPassword(password, resource.password);
    }

    if (imageKey) {
      // S3 파일 이동
      const permanentKey = await moveFileToPermanent(imageKey, 'users');
      const fileUrl = getFileUrl(permanentKey);
      imageData = { key: permanentKey, fileUrl };
    }

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.UserUpdateInput = {
      ...(nickname !== resource.nickname && { nickname }),
      ...(newPassword && { password: await hashPassword(newPassword) }),
      ...(imageData && {
        userImage: {
          disconnect: true,
          create: imageData,
        },
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('수정할 내용이 없습니다.');
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
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');

    // 데이터 가공
    const userData = user.products;

    return userData;
  };

  // 사용자가 좋아요 누른 상품 조회
  public getUserLike = async (id: string) => {
    const user = await this.userRepository.getUserLike(id);
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');

    // 데이터 가공
    const userData = user.productLikes;

    return userData;
  };
}
