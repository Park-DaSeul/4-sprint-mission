import prisma from '../libs/prisma.js';
import { getOneByIdOrFail, verifyPassword, hashPassword, meSelect, productSelect } from '../utils/index.js';

// 사용자 조회
export const getUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: meSelect,
  });
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');
  return user;
};

// 사용자 수정
export const updateUser = async (id, data) => {
  const { nickname, imageUrl, password, newPassword } = data;
  // 사용자가 존재하는지 확인
  const userData = await getOneByIdOrFail(prisma.user, id, '사용자');
  if (userData.id !== id) {
    throw new Error('사용자를 수정할 권한이 없습니다.');
  }
  await verifyPassword(password, userData.password);

  const updateData = {
    ...(nickname && { nickname }),
    ...(imageUrl && { imageUrl }),
    // 비밀번호 해시 처리
    ...(newPassword && { password: await hashPassword(newPassword) }),
  };

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: meSelect,
  });
  return user;
};

// 사용자 삭제
export const deleteUser = async (id, data) => {
  const { password } = data;
  // 사용자가 존재하는지 확인
  const userData = await getOneByIdOrFail(prisma.user, id, '사용자');
  if (userData.id !== id) {
    throw new Error('사용자를 삭제할 권한이 없습니다.');
  }
  await verifyPassword(password, userData.password);

  await prisma.user.delete({
    where: { id },
  });
};

// 사용자가 등록한 상품 목록 조회
export const getUserProducts = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      products: {
        select: productSelect,
      },
    },
  });
  if (!user) throw new Error('사용자가 등록한 상품을 찾을 수 없습니다.');
  return user;
};
