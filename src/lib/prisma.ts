import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

// PrismaClient 인스턴스를 전역적으로 관리하여 핫 리로딩 시 새로운 인스턴스 생성을 방지
// 개발 환경에서만 전역 변수를 사용하고, 프로덕션 환경에서는 직접 인스턴스를 생성
const prisma = global.prisma || new PrismaClient();

if (config.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
