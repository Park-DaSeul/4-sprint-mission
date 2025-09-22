import * as userRepository from './users.repository.js';
import { verifyPassword, hashPassword } from '../../utils/index.js';
import type { UpdateUserData, UpdateUserRepositoryData, DeleteUserData } from './users.dto.js';
import { deleteFile } from '../../utils/index.js';

// 사용자 조회
export const getUser = async (id: string) => {
  const user = await userRepository.getUser(id);
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');

  return user;
};

// 사용자 수정
export const updateUser = async (id: string, data: UpdateUserData) => {
  const { nickname, password, newPassword } = data;

  // 사용자 존재 확인
  const userData = await userRepository.findUser(id);
  if (!userData) throw new Error('사용자를 찾을 수 없습니다.');
  if (userData.id !== id) throw new Error('사용자를 수정할 권한이 없습니다.');

  // 비밀번호 확인
  await verifyPassword(password, userData.password);

  // 기존 데이터와 새 데이터 비교
  // const updateData: Partial<UpdateUserRepositoryData> = {};
  // if (nickname !== userData.nickname) updateData.nickname = nickname;
  // if (imageUrl !== userData.imageUrl) updateData.imageUrl = imageUrl ?? null;
  // if (newPassword) updateData.password = await hashPassword(newPassword);

  // 기존 데이터와 새 데이터 비교
  const updateData: Partial<UpdateUserRepositoryData> = {
    ...(nickname !== userData.nickname && { nickname }),
    ...(newPassword && { password: await hashPassword(newPassword) }),
  };

  if (Object.keys(updateData).length === 0) {
    throw new Error('수정할 내용이 없습니다.');
  }

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

// 사용자 이미지 수정
export const updateUserImage = async (id: string, imageUrl: string) => {
  // 사용자 존재 확인
  const userData = await userRepository.findUser(id);
  if (!userData) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  if (userData.id !== id) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('사용자를 수정할 권한이 없습니다.');
  }
  if (!imageUrl) throw new Error('수정할 이미지가 없습니다.');

  const updateData = { imageUrl };

  const user = await userRepository.updateUserImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (userData.imageUrl) {
    await deleteFile(userData.imageUrl);
  }

  return user;
};

// 사용자 이미지 삭제
export const deleteUserImage = async (id: string) => {
  // 사용자 존재 확인
  const userData = await userRepository.findUser(id);
  if (!userData) throw new Error('사용자를 찾을 수 없습니다.');
  if (userData.id !== id) throw new Error('사용자를 수정할 권한이 없습니다.');

  const updateData = { imageUrl: null };

  await userRepository.updateUserImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (userData.imageUrl) {
    await deleteFile(userData.imageUrl);
  }

  return;
};

// 사용자가 등록한 상품 조회
export const getUserProducts = async (id: string) => {
  const user = await userRepository.getUserProducts(id);
  if (!user) throw new Error('사용자가 등록한 상품을 찾을 수 없습니다.');

  return user;
};

// 사용자가 좋아요 누른 상품 조회
export const getUserLikedProducts = async (id: string) => {
  const user = await userRepository.getUserLikedProducts(id);
  if (!user) throw new Error('사용자가 좋아요 누른 상품을 찾을 수 없습니다.');

  const userData = user.productLikes.map((productLike) => productLike.product);

  return userData;
};
