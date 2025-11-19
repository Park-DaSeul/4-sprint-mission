import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Notification } from '@prisma/client';
import crypto from 'crypto';

describe('Notification API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let notification1: Notification;
  let notification2: Notification;

  const user1Password = 'password123';
  const user2Password = 'password456';
  const nonExistentId = crypto.randomUUID();

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-notification@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 2 생성
    const hashedPassword2 = await bcrypt.hash(user2Password, 10);
    user2 = await prisma.user.create({
      data: {
        email: 'user2-notification@test.com',
        nickname: 'user2',
        password: hashedPassword2,
      },
    });

    // 유저 1 로그인 및 쿠키 획득
    const loginRes1 = await request(app).post('/auth/login').send({
      email: user1.email,
      password: user1Password,
    });
    user1Cookies = loginRes1.get('Set-Cookie')!;

    // 알림 생성 1 (읽지 않음)
    notification1 = await prisma.notification.create({
      data: {
        message: '테스트 알림 1',
        recipientId: user1.id,
        senderId: user2.id,
        type: 'PRODUCT_LIKE',
      },
    });

    // 알림 생성 2 (읽음)
    notification2 = await prisma.notification.create({
      data: {
        message: '테스트 알림 2',
        recipientId: user1.id,
        senderId: user2.id,
        type: 'PRODUCT_LIKE',
        isRead: true,
      },
    });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 사용자 모든 알림 조회
  describe('GET /notifications', () => {
    it('인증된 사용자는 자신의 모든 알림 목록 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/notifications').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      // user1의 알림 2개
      expect(response.body.data.notifications.length).toBe(2);
      expect(response.body.data.notifications[0].message).toBe(notification2.message);
    });

    it('인증안된 사용자는 알림 목록 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get('/notifications');

      expect(response.status).toBe(401);
    });
  });

  // 사용자 알림 개수 조회 (안읽음)
  describe('GET /notifications/unreadCount', () => {
    it('인증된 사용자는 안 읽은 알림의 개수 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/notifications/unreadCount').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // user1의 안 읽은 알림 1개
      expect(response.body.data).toBe(1);
    });

    it('인증안된 사용자는 안 읽은 알림의 개수 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get('/notifications/unreadCount');

      expect(response.status).toBe(401);
    });
  });

  // 사용자 모든 알림 수정 (읽음)
  describe('PUT /notifications/all', () => {
    it('인증된 사용자는 안 읽은 모든 알림의 읽음 처리에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).put('/notifications/all').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      // user1의 안 읽은 알림 1개
      expect(response.body.data.count).toBe(1);

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbNotification1 = await prisma.notification.findUnique({
        where: { id: notification1.id },
      });
      expect(dbNotification1.isRead).toBe(true);

      const dbNotification2 = await prisma.notification.findUnique({
        where: { id: notification2.id },
      });
      expect(dbNotification2.isRead).toBe(true);
    });

    it('인증안된 사용자는 안 읽은 모든 알림의 읽음 처리에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put('/notifications/all');

      expect(response.status).toBe(401);
    });
  });

  // 사용자 알림 수정 (읽음)
  describe('PATCH /notifications/:id/read', () => {
    it('인증된 사용자는 자신의 알림을 읽음 처리에 성공해야 합니다 (200 OK)', async () => {
      // ---  준비 (Arrange) ---
      // 테스트를 위해 notification1은 다시 '읽지 않음' 상태여야 함
      await prisma.notification.update({
        where: {
          id: notification1.id,
        },
        data: { isRead: false },
      });

      const response = await request(app).put(`/notifications/${notification1.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.isRead).toBe(true);

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbNotification = await prisma.notification.findUnique({
        where: { id: notification1.id },
      });
      expect(dbNotification.isRead).toBe(true);
    });

    it('인증안된 사용자는 알림 읽음 처리에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put(`/notifications/${notification1.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 알림에는 읽음 처리에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).put(`/notifications/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });
  });
});
