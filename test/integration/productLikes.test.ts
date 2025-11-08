import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Product, ProductLike } from '@prisma/client';
import crypto from 'crypto';
import { vi } from 'vitest';

// 가짜 io .to(...).emit(...) 준비
const emitMock = vi.fn();
const toMock = vi.fn(() => ({ emit: emitMock }));
const ioMock = { to: toMock };

// getSocketIo 함수를 모킹
vi.mock('../../src/lib/socket.js', () => ({
  getSocketIo: vi.fn(() => ioMock),
}));

describe('Product Like API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let user2Cookies: string[];
  let product: Product;
  let like: ProductLike;

  const user1Password = 'password123';
  const user2Password = 'password456';
  const nonExistentId = crypto.randomUUID();

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-like@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 2 생성
    const hashedPassword2 = await bcrypt.hash(user2Password, 10);
    user2 = await prisma.user.create({
      data: {
        email: 'user2-comment@test.com',
        nickname: 'user2',
        password: hashedPassword2,
      },
    });

    // 유저 1의 상품 생성
    product = await prisma.product.create({
      data: {
        name: '테스트 상품 생성',
        description: '테스트 내용 생성',
        price: 10000,
        tags: ['테스트', '태그'],
        userId: user1.id,
      },
    });

    // 유저 1 로그인 및 쿠키 획득
    const loginRes1 = await request(app).post('/auth/login').send({
      email: user1.email,
      password: user1Password,
    });
    user1Cookies = loginRes1.get('Set-Cookie')!;

    // 유저 2 로그인 및 쿠키 획득
    const loginRes2 = await request(app).post('/auth/login').send({
      email: user2.email,
      password: user2Password,
    });
    user2Cookies = loginRes2.get('Set-Cookie')!;
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 상품 좋아요 생성 (토글)
  describe('POST /products/:productId/likes', () => {
    it('인증된 사용자는 좋아요 생성에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post(`/products/${product.id}/likes`).set('Cookie', user1Cookies).send();

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.user.id).toBe(user1.id);
      // 생성된 좋아요을 저장하여 다른 테스트에서 사용
      like = response.body.data;

      // DB에 실제로 데이터가 저장되었는지 확인
      const dbLike = await prisma.productLike.findUnique({
        where: { id: like.id },
      });

      expect(dbLike).not.toBeNull();
      expect(dbLike.userId).toBe(user1.id);
    });

    it('좋아요를 다시 생성하면 좋아요 취소에 성공해야 합니다 (토글 OFF) (200 OK)', async () => {
      const response = await request(app).post(`/products/${product.id}/likes`).set('Cookie', user1Cookies).send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('좋아요를 취소했습니다.');

      // DB에서 실제로 데이터가 삭제되었는지 확인
      const dbLike = await prisma.productLike.findUnique({
        where: { id: like.id },
      });

      expect(dbLike).toBeNull();
    });

    it('다른 사용자가 좋아요 생성시 알림을 보내고 DB 저장에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post(`/products/${product.id}/likes`).set('Cookie', user2Cookies).send();

      expect(response.status).toBe(201);

      // DB에 실제로 데이터가 생성되었는지 확인
      const dbNotification = await prisma.notification.findFirst({
        where: {
          recipientId: user1.id,
          entityId: product.id,
        },
      });

      expect(dbNotification).not.toBeNull();
      expect(dbNotification.senderId).toBe(user2.id);
      expect(dbNotification.type).toBe('PRODUCT_LIKE');
    });

    it('인증안된 사용자는 좋아요 생성에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post(`/products/${product.id}/likes`).send();

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 상품에는 좋아요 생성에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).post(`/products/${nonExistentId}/likes`).set('Cookie', user1Cookies).send();

      expect(response.status).toBe(404);
    });
  });
});
