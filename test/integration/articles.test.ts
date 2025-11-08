import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Article } from '@prisma/client';
import crypto from 'crypto';
import { CreateArticleBody, UpdateArticleBody } from '../../src/modules/articles/article.dto.js';

describe('Article API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let user2Cookies: string[];
  let user2article1: Article;
  let user2article2: Article;
  let article: Article;

  let createArticle: CreateArticleBody;
  let updateArticle: UpdateArticleBody;

  const user1Password = 'password123';
  const user2Password = 'password456';
  const nonExistentId = crypto.randomUUID();

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.articleLike.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-article@test.com',
        nickname: 'user1',
        password: hashedPassword1,
      },
    });

    // 유저 2 생성
    const hashedPassword2 = await bcrypt.hash(user2Password, 10);
    user2 = await prisma.user.create({
      data: {
        email: 'user2-article@test.com',
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

    // 페이지네이션 테스트를 위한 추가 게시글 생성 (15개)
    const articlePromises = [];
    for (let i = 0; i < 15; i++) {
      articlePromises.push(
        prisma.article.create({
          data: {
            title: `페이지네이션 테스트 게시글 ${i + 1}`,
            content: `페이지네이션 테스트 내용 ${i + 1}`,
            userId: user1.id,
          },
        }),
      );
    }
    await Promise.all(articlePromises);

    // 유저 2의 게시글 생성 1 (좋아요 생성)
    user2article1 = await prisma.article.create({
      data: {
        title: '테스트 게시글 1',
        content: '테스트1',
        userId: user2.id,
      },
    });

    // 유저 2의 게시글 생성 2
    user2article2 = await prisma.article.create({
      data: {
        title: '테스트 게시글 2',
        content: '테스트2',
        userId: user2.id,
      },
    });

    // 유저 1의 좋아요 생성 (user2article1에 좋아요)
    await prisma.articleLike.create({
      data: {
        articleId: user2article1.id,
        userId: user1.id,
      },
    });

    // 테스트 객체 준비
    createArticle = {
      title: '테스트 게시글 생성',
      content: '테스트 내용 생성',
    };
    updateArticle = {
      title: '테스트 게시글 수정',
      content: '테스트 내용 수정',
    };
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.articleLike.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 게시글 생성
  describe('POST /articles', () => {
    it('인증된 사용자는 게시글 생성에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app).post('/articles').set('Cookie', user1Cookies).send(createArticle);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(createArticle.title);
      expect(response.body.data.content).toBe(createArticle.content);
      expect(response.body.data.user.id).toBe(user1.id);
      // 생성된 게시글을 저장하여 다른 테스트에서 사용
      article = response.body.data;

      // DB에 실제로 데이터가 저장되었는지 확인
      const dbArticle = await prisma.article.findUnique({
        where: { id: article.id },
      });

      expect(dbArticle).not.toBeNull();
      expect(dbArticle.title).toBe(createArticle.title);
      expect(dbArticle.content).toBe(createArticle.content);
    });

    it('내용이 없으면 게시글 생성에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app).post('/articles').set('Cookie', user1Cookies).send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('인증안된 사용자는 게시글 생성에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post('/articles').send(createArticle);

      expect(response.status).toBe(401);
    });
  });

  // 모든 게시글 조회
  describe('GET /articles', () => {
    it('누구나 모든 게시글 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].title).toBe(createArticle.title);
      expect(response.body.data[0].isLiked).toBe(false);
    });

    it('인증된 사용자는 좋아요가 표시된 모든 게시글 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles').set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // DB에 저장된 순서에 따라 인덱스가 달라질 수 있으므로, 좋아요를 누른 게시글을 찾아서 확인
      const likedArticle = response.body.data.find((a: Article & { isLiked: boolean }) => a.id === user2article1.id);
      const unlikedArticle = response.body.data.find((a: Article & { isLiked: boolean }) => a.id === user2article2.id);

      // user2article1는 user1이 좋아요를 눌렀으므로 isLiked가 true여야 함
      expect(likedArticle).not.toBeUndefined();
      expect(likedArticle!.isLiked).toBe(true);

      // user2article2은 user1이 좋아요를 누르지 않았으므로 isLiked가 false여야 함
      expect(unlikedArticle).not.toBeUndefined();
      expect(unlikedArticle!.isLiked).toBe(false);
    });

    it('페이지 네이션, 첫 페이지(offset=0, limit=10)를 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles?offset=0&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(10);
    });

    it('페이지 네이션, offset을 사용하여 다음 페이지를 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles?offset=10&limit=10');

      // 15 (페이지 네이션 생성) + 2 (article1, article2) + 1 (POST 테스트) = 18
      // offset=10이므로 나머지 8개가 조회되어야 함
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(8);
    });

    it('제목으로 검색, "생성"이 포함된 게시글을 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles?search=생성');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toContain('생성');
    });

    it('검색 결과가 없는 경우, 빈 배열을 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get('/articles?search=없는검색어');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  // 특정 게시글 조회
  describe('GET /articles/:id', () => {
    it('인증된 사용자는 특정 게시글 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get(`/articles/${article.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(article.id);
      expect(response.body.data.title).toBe(createArticle.title);
    });

    it('인증안된 사용자는 특정 게시글 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get(`/articles/${article.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 게시글에는 조회에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).get(`/articles/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });
  });

  // 게시글 수정
  describe('PUT /articles/:id', () => {
    it('게시글 작성자는 게시글 수정에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app)
        .put(`/articles/${article.id}`)
        .set('Cookie', user1Cookies)
        .send(updateArticle);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(updateArticle.title);
      expect(response.body.data.content).toBe(updateArticle.content);

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbComment = await prisma.article.findUnique({
        where: { id: article.id },
      });

      expect(dbComment.title).toBe(updateArticle.title);
      expect(dbComment.content).toBe(updateArticle.content);
    });

    it('수정할 내용이 없으면 게시글 수정에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app)
        .put(`/articles/${article.id}`)
        .set('Cookie', user1Cookies)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('게시글 작성자가 아니면 수정에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app)
        .put(`/articles/${article.id}`)
        .set('Cookie', user2Cookies)
        .send(updateArticle);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 게시글 수정에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put(`/articles/${article.id}`).send(updateArticle);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 게시글에는 수정에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app)
        .put(`/articles/${nonExistentId}`)
        .set('Cookie', user1Cookies)
        .send(updateArticle);

      expect(response.status).toBe(404);
    });
  });

  // 게시글 삭제
  describe('DELETE /articles/:id', () => {
    it('게시글 작성자가 아니면 삭제에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app).delete(`/articles/${article.id}`).set('Cookie', user2Cookies);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 게시글 삭제에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).delete(`/articles/${article.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 게시글에는 삭제에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).delete(`/articles/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });

    it('게시글 작성자는 게시글 삭제에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).delete(`/articles/${article.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('게시글이 삭제되었습니다.');

      // DB에 실제로 데이터가 삭제되었는지 확인
      const dbArticle = await prisma.article.findUnique({
        where: { id: article.id },
      });

      expect(dbArticle).toBeNull();
    });
  });
});
