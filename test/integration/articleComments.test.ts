import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { User, Article, ArticleComment } from '@prisma/client';
import crypto from 'crypto';
import { vi } from 'vitest';
import {
  CreateArticleCommentBody,
  UpdateArticleCommentBody,
} from '../../src/modules/articleComments/articleComment.dto.js';

// 가짜 io .to(...).emit(...) 준비
const emitMock = vi.fn();
const toMock = vi.fn(() => ({ emit: emitMock }));
const ioMock = { to: toMock };

// getSocketIo 함수를 모킹
vi.mock('../../src/lib/socket.js', () => ({
  getSocketIo: vi.fn(() => ioMock),
}));

describe('Article Comment API 통합 테스트', () => {
  let user1: User;
  let user2: User;
  let user1Cookies: string[];
  let user2Cookies: string[];
  let article: Article;
  let comment: ArticleComment;

  let createComment: CreateArticleCommentBody;
  let updateComment: UpdateArticleCommentBody;

  const user1Password = 'password123';
  const user2Password = 'password456';
  const nonExistentId = crypto.randomUUID();

  beforeAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.articleComment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();

    // 유저 1 생성
    const hashedPassword1 = await bcrypt.hash(user1Password, 10);
    user1 = await prisma.user.create({
      data: {
        email: 'user1-comment@test.com',
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

    // 유저 1의 게시글 생성
    article = await prisma.article.create({
      data: {
        title: '테스트 게시글 생성',
        content: '테스트 내용 생성',
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

    // 페이지네이션 테스트를 위한 추가 댓글 생성 (15개)
    const commentPromises = [];
    for (let i = 0; i < 15; i++) {
      commentPromises.push(
        prisma.articleComment.create({
          data: {
            content: `페이지네이션 테스트 댓글 ${i + 1}`,
            userId: user1.id,
            articleId: article.id,
          },
        }),
      );
    }
    await Promise.all(commentPromises);

    // 테스트 객체 준비
    createComment = {
      content: '테스트 댓글 생성',
    };
    updateComment = {
      content: '테스트 댓글 수정',
    };
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.notification.deleteMany();
    await prisma.articleComment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 게시글 댓글 생성
  describe('POST /articles/:articleId/comments', () => {
    it('인증된 사용자는 댓글 생성에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app)
        .post(`/articles/${article.id}/comments`)
        .set('Cookie', user1Cookies)
        .send(createComment);

      expect(response.status).toBe(201);
      expect(response.body.data.content).toBe(createComment.content);
      expect(response.body.data.user.id).toBe(user1.id);
      // 생성된 댓글을 저장하여 다른 테스트에서 사용
      comment = response.body.data;

      // DB에 실제로 데이터가 생성되었는지 확인
      const dbComment = await prisma.articleComment.findUnique({
        where: { id: comment.id },
      });

      expect(dbComment).not.toBeNull();
      expect(dbComment.content).toBe(createComment.content);
    });

    it('다른 사용자가 댓글 생성시 알림을 보내고 DB 저장에 성공해야 합니다 (201 Created)', async () => {
      const response = await request(app)
        .post(`/articles/${article.id}/comments`)
        .set('Cookie', user2Cookies)
        .send(createComment);

      expect(response.status).toBe(201);

      // DB에 실제로 데이터가 생성되었는지 확인
      const dbNotification = await prisma.notification.findFirst({
        where: {
          recipientId: user1.id,
          entityId: article.id,
        },
      });

      expect(dbNotification).not.toBeNull();
      expect(dbNotification.senderId).toBe(user2.id);
      expect(dbNotification.type).toBe('ARTICLE_COMMENT');
    });

    it('내용이 없으면 댓글 생성에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app)
        .post(`/articles/${article.id}/comments`)
        .set('Cookie', user1Cookies)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('인증안된 사용자는 댓글 생성에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).post(`/articles/${article.id}/comments`).send(createComment);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 게시글에는 댓글 생성에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app)
        .post(`/articles/${nonExistentId}/comments`)
        .set('Cookie', user1Cookies)
        .send(createComment);

      expect(response.status).toBe(404);
    });
  });

  // 게시글 모든 댓글 조회
  describe('GET /articles/:articleId/comments', () => {
    it('인증된 사용자는 게시글 모든 댓글 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get(`/articles/${article.id}/comments`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.articleComments)).toBe(true);
      expect(response.body.data.articleComments[0].content).toBe(createComment.content);
    });

    it('인증안된 사용자는 게시글 모든 댓글 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get(`/articles/${article.id}/comments`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 게시글에는 댓글 조회에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).get(`/articles/${nonExistentId}/comments`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });

    it('페이지 네이션, 첫 페이지(limit=10)를 조회해야 합니다 (200 OK)', async () => {
      const response = await request(app).get(`/articles/${article.id}/comments?limit=10`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.articleComments.length).toBe(10);
    });

    it('페이지 네이션, cursor를 사용하여 다음 페이지를 조회해야 합니다 (200 OK)', async () => {
      const firstResponse = await request(app)
        .get(`/articles/${article.id}/comments?limit=10`)
        .set('Cookie', user1Cookies);
      const cursor = firstResponse.body.data.nextCursor;

      const secondResponse = await request(app)
        .get(`/articles/${article.id}/comments?limit=10&cursor=${cursor}`)
        .set('Cookie', user1Cookies);

      expect(secondResponse.status).toBe(200);
      // 15 (시작시 생성) + 2 (테스트 생성) - 10 (첫 페이지) = 7
      expect(secondResponse.body.data.articleComments.length).toBe(7);
    });
  });

  // 게시글 특정 댓글 조회
  describe('GET /articleComments/:id', () => {
    it('인증된 사용자는 특정 댓글 조회에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).get(`/articleComments/${comment.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(comment.id);
      expect(response.body.data.content).toBe(createComment.content);
    });

    it('인증안된 사용자는 특정 댓글 조회에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).get(`/articleComments/${comment.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 댓글에는 댓글 조회에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).get(`/articleComments/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });
  });

  // 게시글 댓글 수정
  describe('PUT /articleComments/:id', () => {
    it('댓글 작성자는 댓글 수정에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app)
        .put(`/articleComments/${comment.id}`)
        .set('Cookie', user1Cookies)
        .send(updateComment);

      expect(response.status).toBe(200);
      expect(response.body.data.content).toBe(updateComment.content);

      // DB에 실제로 데이터가 수정되었는지 확인
      const dbComment = await prisma.articleComment.findUnique({
        where: { id: comment.id },
      });

      expect(dbComment.content).toBe(updateComment.content);
    });

    it('수정할 내용이 없으면 댓글 수정에 실패해야 합니다 (400 Bad Request)', async () => {
      const response = await request(app)
        .put(`/articleComments/${comment.id}`)
        .set('Cookie', user1Cookies)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('댓글 작성자가 아니면 수정에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app)
        .put(`/articleComments/${comment.id}`)
        .set('Cookie', user2Cookies)
        .send(updateComment);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 댓글 수정에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).put(`/articleComments/${comment.id}`).send(updateComment);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 댓글에는 댓글 수정에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app)
        .put(`/articleComments/${nonExistentId}`)
        .set('Cookie', user1Cookies)
        .send(updateComment);

      expect(response.status).toBe(404);
    });
  });

  // 게시글 댓글 삭제
  describe('DELETE /articleComments/:id', () => {
    it('댓글 작성자가 아니면 삭제에 실패해야 합니다 (403 Forbidden)', async () => {
      const response = await request(app).delete(`/articleComments/${comment.id}`).set('Cookie', user2Cookies);

      expect(response.status).toBe(403);
    });

    it('인증안된 사용자는 댓글 삭제에 실패해야 합니다 (401 Unauthorized)', async () => {
      const response = await request(app).delete(`/articleComments/${comment.id}`);

      expect(response.status).toBe(401);
    });

    it('존재하지 않는 댓글에는 댓글 삭제에 실패해야 합니다 (404 Not Found)', async () => {
      const response = await request(app).delete(`/articleComments/${nonExistentId}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(404);
    });

    it('댓글 작성자는 댓글 삭제에 성공해야 합니다 (200 OK)', async () => {
      const response = await request(app).delete(`/articleComments/${comment.id}`).set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('댓글이 삭제되었습니다.');

      // DB에 실제로 데이터가 삭제되었는지 확인
      const dbComment = await prisma.articleComment.findUnique({
        where: { id: comment.id },
      });

      expect(dbComment).toBeNull();
    });
  });
});
