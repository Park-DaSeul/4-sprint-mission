import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app';
import prisma from '../../src/lib/prisma';
import type { User } from '@prisma/client';
import { vi } from 'vitest';
import type { CreateImageBody } from '../../src/modules/images/image.dto.js';

// 모킹에 사용 할 테스트 객체 준비
const fakeImage = {
  url: 'https://fake-url.com/test.png',
  fields: { 'Content-Type': 'image/png' },
  key: 'test.png',
};

// s3-service 함수 모킹
vi.mock('../../src/lib/s3-service.js', () => ({
  getUploadPresignedUrl: vi.fn().mockImplementation((_filename, _contentType) => {
    return fakeImage;
  }),
}));

describe('Image API 통합 테스트', () => {
  let user1: User;
  let user1Cookies: string[];

  let createImage: CreateImageBody;

  const user1Password = 'password123';

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-image@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 1 로그인 및 쿠키 획득
    const loginRes1 = await request(app).post('/auth/login').send({
      email: user1.email,
      password: user1Password,
    });
    user1Cookies = loginRes1.get('Set-Cookie')!;

    // 테스트 객체 준비
    createImage = {
      filename: 'test.png',
      contentType: 'image/png',
    };
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 사진 생성 (업로드)
  describe('POST /images', () => {
    it('인증된 사용자는 Presigned URL 받기에 성공해야 합니다 (200 Created)', async () => {
      const response = await request(app).post(`/images/upload`).set('Cookie', user1Cookies).send(createImage);

      expect(response.status).toBe(200);
      expect(response.body.data.key).toBe(createImage.filename);
      expect(response.body.data.url).toBe(fakeImage.url);
    });

    it('인증안된 사용자는 Presigned URL 받기에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post(`/images`).send();

      expect(response.status).toBe(401);
    });
  });
});
