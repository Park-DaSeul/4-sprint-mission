import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User } from '@prisma/client';
import { SignupBody, LoginBody } from '../../src/modules/auth/auth.dto.js';

describe('Auth API 통합 테스트', () => {
  let user1: User;
  let user1Cookies: string[];
  let user: User;

  let signupUser: SignupBody;
  let login: LoginBody;

  const user1Password = 'password123';

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-auth@test.com',
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
    signupUser = {
      email: 'signup@test.com',
      nickname: '테스트 닉네임',
      password: user1Password,
    };

    login = {
      email: 'signup@test.com',
      password: user1Password,
    };
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 회원가입
  describe('POST /auth/signup', () => {
    it('새로운 사용자는 회원가입에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post('/auth/signup').send(signupUser);

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe(signupUser.email);
      expect(response.body.data.nickname).toBe(signupUser.nickname);
      // 비밀번호는 노출되면 안 됨
      expect(response.body.data).not.toHaveProperty('password');
      // 생성된 사용자를 저장하여 다른 테스트에서 사용
      user = response.body.data;

      // DB에 실제로 데이터가 생성되었는지 확인
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser.email).toBe(signupUser.email);
      // 비밀번호가 해시되어 저장되었는지 확인
      const isPasswordMatch = await bcrypt.compare(signupUser.password, dbUser.password);
      expect(isPasswordMatch).toBe(true);
    });

    it('필수 필드가 없으면 회원가입에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'bad@test.com',
      });

      expect(response.status).toBe(400);
    });

    it('이미 존재하는 이메일로는 회원가입에 실패해야 합니다 (409 Conflict)', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          ...signupUser,
          email: user.email,
        });

      expect(response.status).toBe(409);
    });
  });

  // 로그인
  describe('POST /auth/login', () => {
    it('올바른 정보로 쿠기를 발급 받고 로그인에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).post('/auth/login').send(login);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const cookies = response.get('Set-Cookie')!;
      expect(cookies.some((cookie) => cookie.startsWith('access-token='))).toBe(true);
      expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);
    });

    it('존재하지 않는 이메일로 로그인에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password',
      });

      expect(response.status).toBe(401);
    });

    it('틀린 비밀번호로 로그인에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          ...login,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  // 토큰 재발급
  describe('POST /auth/refresh', () => {
    it('유효한 리프레시 토큰으로 새로운 액세스 토큰 재발급에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).post('/auth/refresh').set('Cookie', user1Cookies).send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 새로운 accessToken이 발급되었는지 확인
      const cookies = response.get('Set-Cookie')!;
      expect(cookies.some((cookie) => cookie.startsWith('access-token='))).toBe(true);
    });

    it('인증안된 사용자는 토큰 재발급에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post('/auth/refresh').send();

      expect(response.status).toBe(401);
    });
  });

  // 로그아웃
  describe('POST /auth/logout', () => {
    it('인증안된 사용자는 로그아웃에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post('/auth/logout').send();

      expect(response.status).toBe(401);
    });

    it('인증된 사용자는 쿠기를 삭제하고 로그아웃에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).post('/auth/logout').set('Cookie', user1Cookies).send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('로그아웃 되었습니다.');

      // 쿠키가 삭제 되었는지 확인
      const cookies = response.get('Set-Cookie')!;
      expect(cookies.some((cookie) => cookie.includes('access-token=;'))).toBe(true);
      expect(cookies.some((cookie) => cookie.includes('refresh-token=;'))).toBe(true);
      expect(cookies.some((cookie) => cookie.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'))).toBe(true);
    });
  });
});
