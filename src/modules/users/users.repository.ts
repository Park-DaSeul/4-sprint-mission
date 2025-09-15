import prisma from '../../libs/prisma.js';
import { meSelect, productSelect } from '../../utils/index.js';
import type { UpdateUserRepositoryData } from './users.dto.js';

// 사용자 조회
export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: meSelect,
  });

  return user;
};

// 사용자 수정
export const updateUser = async (id: string, updateData: UpdateUserRepositoryData) => {
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: meSelect,
  });

  return user;
};

// 사용자 삭제
export const deleteUser = async (id: string) => {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
};

// 사용자 존재 확인
export const findUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
};

// 사용자가 등록한 상품 목록 조회
export const getUserProducts = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      products: {
        select: productSelect,
      },
    },
  });

  return user;
};

// 사용자가 좋아요 누른 상품 목록조회
export const getUserLikedProducts = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      productLikes: {
        select: {
          product: {
            select: productSelect,
          },
        },
      },
    },
  });

  return user;
};
