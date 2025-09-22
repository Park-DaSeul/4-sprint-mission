import prisma from '../../libs/prisma.js';
import { meSelect } from '../../utils/index.js';
import type { CreateSignupData } from './auth.dto.js';

// 회원 가입
export const signup = async (createData: CreateSignupData) => {
  const user = await prisma.user.create({
    data: createData,
    select: meSelect,
  });
  return user;
};

// 이메일 중복 확인
export const checkUserExistsByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
};
