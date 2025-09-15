import * as userRepository from './users.repository.js';
import { verifyPassword, hashPassword } from '../../utils/index.js';
import type { UpdateUserData, UpdateUserRepositoryData, DeleteUserData } from './users.dto.js';

// 사용자 조회
export const getUser = async (id: string) => {
  const user = await userRepository.getUser(id);
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');

  return user;
};

// 사용자 수정
export const updateUser = async (id: string, data: UpdateUserData) => {
  const { nickname, imageUrl, password, newPassword } = data;

  // 사용자 존재 확인
  const userData = await userRepository.findUser(id);
  if (!userData) throw new Error('사용자를 찾을 수 없습니다.');
  if (userData.id !== id) throw new Error('사용자를 수정할 권한이 없습니다.');

  // 비밀번호 확인
  await verifyPassword(password, userData.password);

  const updateData: UpdateUserRepositoryData = {
    ...(nickname && { nickname }),
    ...(imageUrl && { imageUrl }),
    // 비밀번호 해시 처리
    ...(newPassword && { password: await hashPassword(newPassword) }),
  };

  const user = await userRepository.updateUser(id, updateData);

  return user;
};

// 사용자 삭제
export const deleteUser = async (id: string, data: DeleteUserData) => {
  const { password } = data;

  // 사용자 존재 확인
  const userData = await userRepository.findUser(id);
  if (!userData) throw new Error('사용자를 찾을 수 없습니다.');
  if (userData.id !== id) throw new Error('사용자를 삭제할 권한이 없습니다.');

  // 비밀번호 확인
  await verifyPassword(password, userData.password);

  return await userRepository.deleteUser(id);
};

// 사용자가 등록한 상품 목록 조회
export const getUserProducts = async (id: string) => {
  const user = await userRepository.getUserProducts(id);
  if (!user) throw new Error('사용자가 등록한 상품을 찾을 수 없습니다.');

  return user;
};

// 사용자가 좋아요 누른 상품 목록조회
export const getUserLikedProducts = async (id: string) => {
  const user = await userRepository.getUserLikedProducts(id);
  if (!user) throw new Error('사용자가 좋아요 누른 상품을 찾을 수 없습니다.');

  const userData = user.productLikes.map((productLike) => productLike.product);

  return userData;
};
