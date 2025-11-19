import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Product, ProductLike } from '@prisma/client';
import type { UpdateUserBody } from '../../src/modules/users/user.dto.js';

describe('User API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let user2Cookies: string[];
  let user1Product1: Product;
  let user2Product1: Product;
  let user1LikedProduct: ProductLike;

  let updateUser: UpdateUserBody;

  const user1Password = 'password123';
  const user2Password = 'password456';

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-user@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 2 생성
    const hashedPassword2 = await bcrypt.hash(user2Password, 10);
    user2 = await prisma.user.create({
      data: {
        email: 'user2-user@test.com',
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

    // 페이지네이션 테스트를 위한 추가 상품 생성 (10개)
    const paginationProductsPromises = [];
    for (let i = 0; i < 10; i++) {
      paginationProductsPromises.push(
        prisma.product.create({
          data: {
            name: `user1 페이지네이션 테스트 상품 ${i + 1}`,
            description: `페이지네이션 테스트 설명 ${i + 1}`,
            price: i + 10000,
            tags: ['테스트', '태그'],
            userId: user1.id,
            productImages: {
              create: [
                {
                  publicId: `user1_page_prod_${i}_pubid`,
                  fileUrl: `http://example.com/user1_page_prod_${i}.jpg`,
                },
              ],
            },
          },
        }),
      );
    }
    await Promise.all(paginationProductsPromises);

    // 페이지네이션 테스트를 위한 유저 1의 추가 좋아요 상품 생성 (10개)
    const paginationLikesPromises = [];
    for (let i = 0; i < 10; i++) {
      const productForLike = await prisma.product.create({
        data: {
          name: `user2 페이지네이션 좋아요 상품 ${i + 1}`,
          description: `페이지네이션 테스트 설명 ${i + 1}`,
          price: i + 10000,
          tags: ['테스트', '태그'],
          userId: user2.id,
          productImages: {
            create: [
              {
                publicId: `user2_page_like_prod_${i}_pubid`,
                fileUrl: `http://example.com/user2_page_like_prod_${i}.jpg`,
              },
            ],
          },
        },
      });
      paginationLikesPromises.push(
        prisma.productLike.create({
          data: {
            productId: productForLike.id,
            userId: user1.id,
          },
        }),
      );
    }
    await Promise.all(paginationLikesPromises);

    // 유저 1의 상품 생성 1 (사용자가 등록한 상품 조회 테스트)
    user1Product1 = await prisma.product.create({
      data: {
        name: '테스트 상품 1',
        description: '테스트 상품 설명 1',
        price: 10000,
        tags: ['user1', '상품'],
        userId: user1.id,
        productImages: {
          create: [
            {
              publicId: 'user1_prod1_pubid',
              fileUrl: 'http://example.com/user1_prod1.jpg',
            },
          ],
        },
      },
    });

    // 유저 2의 상품 생성 1 (사용자가 좋아요 누른 상품 조회 테스트)
    user2Product1 = await prisma.product.create({
      data: {
        name: 'user2의 상품 (user1 좋아요)',
        description: 'user2가 등록한 상품 설명',
        price: 30000,
        tags: ['user2', '좋아요'],
        userId: user2.id,
        productImages: {
          create: [
            {
              publicId: 'user2_prod_pubid',
              fileUrl: 'http://example.com/user2_prod.jpg',
            },
          ],
        },
      },
    });

    // 유저 1이 유저 2의 상품에 좋아요 누름 (사용자가 좋아요 누른 상품 조회 테스트)
    user1LikedProduct = await prisma.productLike.create({
      data: {
        productId: user2Product1.id,
        userId: user1.id,
      },
    });

    // 테스트 객제 준비
    updateUser = {
      nickname: '테스트 별명 수정',
    };
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.productLike.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 사용자 조회
  describe('GET /users/me', () => {
    it('인증된 사용자는 자신의 정보를 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/users/me').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user1.id);
      expect(response.body.data.email).toBe(user1.email);
      expect(response.body.data.nickname).toBe(user1.nickname);
      // 비밀번호는 노출되면 안 됨
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('인증안된 사용자는 자신의 정보를 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get('/users/me');

      expect(response.status).toBe(401);
    });
  });

  // 사용자 수정
  describe('PUT /users/me', () => {
    it('인증된 사용자는 자신의 정보 수정에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).put('/users/me').set('Cookie', user1Cookies).send(updateUser);

      expect(response.status).toBe(200);
      expect(response.body.data.nickname).toBe(updateUser.nickname);

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbUser = await prisma.user.findUnique({
        where: { id: user1.id },
      });

      expect(dbUser.nickname).toBe(updateUser.nickname);
    });

    it('수정할 내용이 없으면 자신의 정보 수정에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app).put('/users/me').set('Cookie', user1Cookies).send({ nickname: '' });

      expect(response.status).toBe(400);
    });

    it('인증안된 사용자는 자신의 정보 수정에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put('/users/me').send(updateUser);

      expect(response.status).toBe(401);
    });
  });

  // 사용자가 등록한 상품 조회
  describe('GET /users/me/products', () => {
    it('인증된 사용자는 자신이 등록한 상품 목록 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/users/me/products').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      // 10 (페이지네이션 상품) + 1(user1Product1) = 11
      // 페이지 네이션 추가 후 toBe 수정
      expect(response.body.data.length).toBe(11);

      // DB에 저장된 순서에 따라 인덱스가 달라질 수 있으므로, 생성한 상품을 찾아서 확인
      const createProduct = response.body.data.find((product: Product) => product.id === user1Product1.id);
      expect(createProduct.name).toBe(user1Product1.name);

      // TODO 페이지 네이션 후 추가
      // expect(response.body.data[0].name).toBe(user1Product1.name);
      // expect(response.body.data[0].userId).toBe(user1.id);
    });

    // it('페이지네이션, 첫 페이지(offset=0, limit=10)를 조회해야 합니다 (200 OK)', async () => {
    //   const response = await request(app).get('/users/me/products?offset=0&limit=10').set('Cookie', user1Cookies);

    //   expect(response.status).toBe(200);
    //   expect(response.body.data.length).toBe(10);
    // });

    // it('페이지네이션, offset을 사용하여 다음 페이지를 조회해야 합니다 (200 OK)', async () => {
    //   const response = await request(app).get('/users/me/products?offset=10&limit=10').set('Cookie', user1Cookies);

    //   expect(response.status).toBe(200);
    //   expect(response.body.data.length).toBe(2); // 남은 2개의 상품
    // });

    it('인증안된 사용자는 자신이 등록한 상품 목록 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get('/users/me/products');

      expect(response.status).toBe(401);
    });
  });

  // 사용자가 좋아요 누른 상품 조회
  describe('GET /users/me/likes', () => {
    it('인증된 사용자는 자신이 좋아요 누른 상품 목록 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/users/me/likes').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      // 10 (페이지네이션 좋아요 상품) + 1(user1LikedProduct) = 11
      // 페이지 네이션 추가 후 toBe 수정
      expect(response.body.data.length).toBe(11);

      // DB에 저장된 순서에 따라 인덱스가 달라질 수 있으므로, 좋아요를 누른 상품을 찾아서 확인
      const createProduct = response.body.data.find(
        (like: ProductLike & { product: Product }) => like.id === user1LikedProduct.id,
      );
      expect(createProduct.id).toBe(user1LikedProduct.id);
      expect(createProduct.product.id).toBe(user2Product1.id);
      // TODO 페이지 네이션 후 추가
      // expect(response.body.data[0].id).toBe(user2ProductLikedByUser1.id); // 좋아요 누른 상품인지 확인
      // expect(response.body.data[0].isLiked).toBe(true); // 좋아요 상태 확인
    });

    // it('페이지네이션, 첫 페이지(offset=0, limit=10)를 조회해야 합니다 (200 OK)', async () => {
    //   const response = await request(app).get('/users/me/likes?offset=0&limit=10').set('Cookie', user1Cookies);

    //   expect(response.status).toBe(200);
    //   expect(response.body.data.length).toBe(10);
    // });

    // it('페이지네이션, offset을 사용하여 다음 페이지를 조회해야 합니다 (200 OK)', async () => {
    //   const response = await request(app).get('/users/me/likes?offset=10&limit=10').set('Cookie', user1Cookies);

    //   expect(response.status).toBe(200);
    //   expect(response.body.data.length).toBe(1); // 남은 1개의 좋아요 상품
    // });

    it('인증안된 사용자는 자신이 좋아요 누른 상품 목록 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get('/users/me/likes');

      expect(response.status).toBe(401);
    });
  });

  // 사용자 삭제
  describe('DELETE /users/me', () => {
    it('인증안된 사용자는 계정을 삭제에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).delete('/users/me');

      expect(response.status).toBe(401);
    });

    it('인증된 사용자는 자신의 계정 삭제에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app)
        .delete('/users/me')
        .set('Cookie', user1Cookies)
        .send({ password: user1Password });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('사용자가 삭제되었습니다.');

      // DB에서 실제로 삭제되었는지 확인
      const dbdUser = await prisma.user.findUnique({
        where: { id: user1.id },
      });
      expect(dbdUser).toBeNull();
    });
  });
});
