import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../../src/app.js';
import prisma from '../../../src/lib/prisma.js';
import type { User, ProductImage } from '@prisma/client';
import { vi } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { UploadRequest } from '../../../src/types/request.type.js';
import { v2 as cloudinary } from 'cloudinary';

// 모킹에 사용 할 테스트 객체 준비
const fakeImage = {
  public_id: 'fake_public_id',
  secure_url: 'https://fake-url.com/fake_image.jpg',
};

// cloudinary.upload.middleware.js 모듈 전체를 모킹
vi.mock('../../src/middlewares/cloudinary.upload.middleware.js', () => ({
  // 미들웨어 흉내를 내기 위해 mockImplementation 사용
  cloudinaryUploader: vi.fn().mockImplementation((_options) => {
    // 이 반환된 함수가 실제 미들웨어 역할
    return (req: UploadRequest, res: Response, next: NextFunction) => {
      req.cloudinaryResult = fakeImage;

      next();
    };
  }),
}));

describe('Product Image API 통합 테스트', () => {
  let user1: User;
  let user1Cookies: string[];
  let productImage: ProductImage;

  const user1Password = 'password123';

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.productImage.deleteMany();
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
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.productImage.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 상품 사진 생성 (업로드)
  describe('POST /productImages', () => {
    it('인증된 사용자는 사진 업로드에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post(`/productImages`).set('Cookie', user1Cookies).send();

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // 생성된 이미지를 저장하여 다른 테스트에서 사용
      productImage = response.body;

      // DB에 실제로 테이터가 생성 되었는지 확인
      const dbImage = await prisma.productImage.findFirst({
        where: { id: productImage.id },
      });

      expect(dbImage).not.toBeNull();
      expect(dbImage.id).toBe(productImage.id);
      expect(dbImage.fileUrl).toBe(fakeImage.secure_url);
      expect(dbImage.publicId).toBe(fakeImage.public_id);
    });

    it('인증안된 사용자는 사진 업로드에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post(`/productImages`).send();

      expect(response.status).toBe(401);
    });

    it('DB 저장 실패 시, Cloudinary에 업로드된 이미지를 삭제(롤백)해야 합니다 (500 Internal Server Error)', async () => {
      // ---  준비 (Arrange) ---
      // '몽키 패치'를 사용하여 prisma.productImage.create를 일부러 에러 나게함
      const createMock = vi.fn().mockRejectedValue(new Error('DB 저장 강제 실패'));
      prisma.productImage.create = createMock;

      // Cloudinary 삭제 함수 감시: cloudinary.uploader.destroy 함수를 감시하여 호출 여부를 확인
      const deleteSpy = vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({});

      const response = await request(app).post(`/productImages`).set('Cookie', user1Cookies).send();

      expect(response.status).toBe(500);
      // 롤백 실행 여부 확인: Cloudinary 삭제 함수가 1번 호출되었어야 함
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      // 롤백 함수가 올바른 public_id로 호출되었는지 확인
      expect(deleteSpy).toHaveBeenCalledWith(fakeImage.public_id, {
        type: 'upload',
        resource_type: 'image',
      });
    });
  });
});
