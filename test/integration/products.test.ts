import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Product, ProductImage } from '@prisma/client';
import crypto from 'crypto';
import { vi } from 'vitest';
import type { CreateProductBody, UpdateProductBody } from '../../src/modules/products/product.dto.js';

// 가짜 io .to(...).emit(...) 준비
const emitMock = vi.fn();
const toMock = vi.fn(() => ({ emit: emitMock }));
const ioMock = { to: toMock };

// getSocketIo 함수를 모킹
vi.mock('../../src/lib/socket.js', () => ({
  getSocketIo: vi.fn(() => ioMock),
}));

describe('Product API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let user2Cookies: string[];
  let user2product1: Product;
  let user2product2: Product;
  let Image1: ProductImage;
  let product: Product;

  let createProduct: CreateProductBody;
  let updateProduct: UpdateProductBody;

  const user1Password = 'password123';
  const user2Password = 'password456';
  const nonExistentId = crypto.randomUUID();

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-product@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 2 생성
    const hashedPassword2 = await bcrypt.hash(user2Password, 10);
    user2 = await prisma.user.create({
      data: {
        email: 'user2-product@test.com',
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

    // 유저 2 로그인 및 쿠키 획득
    const loginRes2 = await request(app).post('/auth/login').send({
      email: user2.email,
      password: user2Password,
    });
    user2Cookies = loginRes2.get('Set-Cookie')!;

    // 페이지네이션 테스트를 위한 추가 상품 생성 (15개)
    const productPromises = [];
    for (let i = 0; i < 15; i++) {
      productPromises.push(
        prisma.product.create({
          data: {
            name: `페이지네이션 테스트 상품 ${i + 1}`,
            description: `페이지네이션 테스트 설명 ${i + 1}`,
            price: i + 10000,
            tags: ['테스트', '태그'],
            userId: user1.id,
            productImages: {
              create: [
                {
                  publicId: `test_public_id_${i}`,
                  fileUrl: `https://test-url.com/test_image_${i}.jpg`,
                },
              ],
            },
          },
        }),
      );
    }
    await Promise.all(productPromises);

    // 유저 2의 상품 생성 1 (좋아요 생성)
    user2product1 = await prisma.product.create({
      data: {
        name: '테스트 상품 1',
        description: '테스트1',
        price: 10000,
        tags: ['테스트1', '태그1'],
        userId: user2.id,
        productImages: {
          create: [
            {
              publicId: `fake_public_id_1`,
              fileUrl: `https://fake-url.com/fake_image_1.jpg`,
            },
          ],
        },
      },
    });

    // 유저 2의 상품 생성 2
    user2product2 = await prisma.product.create({
      data: {
        name: '테스트 상품 2',
        description: '테스트2',
        price: 20000,
        tags: ['테스트2', '태그2'],
        userId: user2.id,
        productImages: {
          create: [
            {
              publicId: `fake_public_id_2`,
              fileUrl: `https://fake-url.com/fake_image_2.jpg`,
            },
          ],
        },
      },
    });

    // 유저 1 좋아요 생성 (user2product1에 좋아요)
    await prisma.productLike.create({
      data: {
        productId: user2product1.id,
        userId: user1.id,
      },
    });

    // 사진 생성 1
    Image1 = await prisma.productImage.create({
      data: {
        publicId: 'fake_public_id-1',
        fileUrl: 'https://fake-url.com/fake_image-1.jpg',
      },
    });

    // 테스트 객체 준비
    createProduct = {
      name: '테스트 상품 생성',
      description: '테스트 설명 생성',
      price: 10000,
      tags: ['테스트', '태그'],
      imageIds: [{ id: Image1.id }],
    };
    updateProduct = {
      name: '테스트 상품 수정',
      description: '테스트 설명 수정',
      price: 10000,
      tags: ['테스트', '태그'],
    };
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 상품 생성
  describe('POST /products', () => {
    it('인증된 사용자는 상품 생성에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post('/products').set('Cookie', user1Cookies).send(createProduct);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(createProduct.name);
      expect(response.body.data.description).toBe(createProduct.description);
      expect(response.body.data.price).toBe(createProduct.price);
      expect(response.body.data.tags).toEqual(expect.arrayContaining(createProduct.tags));
      expect(response.body.data.user.id).toBe(user1.id);
      // 생성된 상품을 저장하여 다른 테스트에서 사용
      product = response.body.data;

      // DB에 실제로 데이터가 저장되었는지 확인
      const dbProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(dbProduct).not.toBeNull();
      expect(dbProduct.name).toBe(createProduct.name);
      expect(dbProduct.description).toBe(createProduct.description);
      expect(dbProduct.price).toBe(createProduct.price);
      expect(dbProduct.tags).toEqual(expect.arrayContaining(createProduct.tags));
    });

    it('내용이 없으면 상품 생성에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app).post('/products').set('Cookie', user1Cookies).send({ description: '' });

      expect(response.status).toBe(400);
    });

    it('인증안된 사용자는 상품 생성에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post('/products').send(createProduct);

      expect(response.status).toBe(401);
    });
  });

  // 모든 상품 조회
  describe('GET /products', () => {
    it('누구나 모든 상품 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].name).toBe(createProduct.name);
      expect(response.body.data[0].isLiked).toBe(false);
    });

    it('인증된 사용자는 좋아요가 표시된 모든 상품 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // DB에 저장된 순서에 따라 인덱스가 달라질 수 있으므로, 좋아요를 누른 상품을 찾아서 확인
      const likedProduct = response.body.data.find((a: Product & { isLiked: boolean }) => a.id === user2product1.id);
      const unlikedProduct = response.body.data.find((a: Product & { isLiked: boolean }) => a.id === user2product2.id);

      // user2product1는 user1이 좋아요를 눌렀으므로 isLiked가 true여야 함
      expect(likedProduct).not.toBeUndefined();
      expect(likedProduct!.isLiked).toBe(true);

      // user2product2은 user1이 좋아요를 누르지 않았으므로 isLiked가 false여야 함
      expect(unlikedProduct).not.toBeUndefined();
      expect(unlikedProduct!.isLiked).toBe(false);
    });

    it('페이지 네이션, 첫 페이지(offset=0, limit=10)를 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products?offset=0&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(10);
    });

    it('페이지 네이션, offset을 사용하여 다음 페이지를 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products?offset=10&limit=10');

      // 15 (페이지 네이션 생성) + 2 (article1, article2) + 1 (POST 테스트) = 18
      // offset=10이므로 나머지 8개가 조회되어야 함
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(8);
    });

    it('이름으로 검색, "생성"이 포함된 상품을 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products?search=생성');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toContain('생성');
    });

    it('검색 결과가 없는 경우, 빈 배열을 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/products?search=없는검색어');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  // 특정 상품 조회
  describe('GET /products/:id', () => {
    it('인증된 사용자는 특정 상품 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get(`/products/${product.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe(createProduct.name);
    });

    it('인증안된 사용자는 특정 상품 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get(`/products/${product.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 상품에는 조회에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).get(`/products/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });
  });

  // 상품 수정
  describe('PUT /products/:id', () => {
    it('상품 작성자는 상품 수정에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app)
        .put(`/products/${product.id}`)
        .set('Cookie', user1Cookies)
        .send(updateProduct);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateProduct.name);
      expect(response.body.data.description).toBe(updateProduct.description);
      expect(response.body.data.price).toBe(updateProduct.price);
      expect(response.body.data.tags).toEqual(expect.arrayContaining(updateProduct.tags));

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(dbProduct.name).toBe(updateProduct.name);
      expect(dbProduct.description).toBe(updateProduct.description);
      expect(dbProduct.price).toBe(updateProduct.price);
      expect(dbProduct.tags).toEqual(expect.arrayContaining(updateProduct.tags));
    });

    it('상품 가격 수정 시 좋아요 누른 사용자에게 알림을 보내고 DB 저장에 성공해야 합니다 (200 OK)', async () => {
      // --- 준비 (Arrange) ---
      // user2product1은 user1이 좋아요를 누른 상품
      const updateProductWithPriceChange = {
        ...updateProduct,
        // 가격을 변경하여 알림 로직 트리거
        price: user2product1.price + 1000,
      };

      const response = await request(app)
        .put(`/products/${user2product1.id}`)
        .set('Cookie', user2Cookies)
        .send(updateProductWithPriceChange);

      expect(response.status).toBe(200);

      // DB에 실제로 테이터가 생성되었는지 확인
      const dbNotification = await prisma.notification.findFirst({
        where: {
          recipientId: user1.id,
          entityId: user2product1.id,
        },
      });

      expect(dbNotification).not.toBeNull();
      expect(dbNotification.senderId).toBe(user2.id);
      expect(dbNotification.type).toBe('PRODUCT_PRICE_CHANGE');
    });

    it('수정할 내용이 없으면 상품 수정에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app)
        .put(`/products/${product.id}`)
        .set('Cookie', user1Cookies)
        .send({ description: '' });

      expect(response.status).toBe(400);
    });

    it('상품 작성자가 아니면 수정에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app)
        .put(`/products/${product.id}`)
        .set('Cookie', user2Cookies)
        .send(updateProduct);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 상품 수정에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put(`/products/${product.id}`).send(updateProduct);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 상품에는 수정에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app)
        .put(`/products/${nonExistentId}`)
        .set('Cookie', user1Cookies)
        .send(updateProduct);

      expect(response.status).toBe(404);
    });
  });

  // 상품 삭제
  describe('DELETE /products/:id', () => {
    it('상품 작성자가 아니면 삭제에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app).delete(`/products/${product.id}`).set('Cookie', user2Cookies);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 상품 삭제에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).delete(`/products/${product.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 상품에는 삭제에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).delete(`/products/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });

    it('상품 작성자는 상품 삭제에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).delete(`/products/${product.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('상품이 삭제되었습니다.');

      // DB에 실제로 데이터가 삭제되었는지 확인
      const dbProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(dbProduct).toBeNull();
    });
  });
});
