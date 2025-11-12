import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// 개발환경(핫리로드)에서 Prisma Client가 여러번 생성되지 않게 처리
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
