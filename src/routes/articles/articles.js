import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import commentsRouter from './articleComments.js';
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
} from '../../schemas/articles/articleSchema.js';

const prisma = new PrismaClient();
const router = express.Router();

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const { offset = 0, limit = 10, order = 'recent' } = req.query;
      //offset 방식의 페이지 네이션
      let orderBy;
      switch (order) {
        case 'old':
          orderBy = { createdAt: 'asc' };
          break;
        case 'recent':
        default:
          orderBy = { createdAt: 'desc' };
      }
      const articles = await prisma.article.findMany({
        orderBy,
        skip: parseInt(offset),
        take: parseInt(limit),
      });
      res.json(articles);
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const newData = createArticleSchema.parse(req.body); //유효성 검사
      const article = await prisma.article.create({
        data: newData,
      });
      res.status(201).json(article);
    }),
  );

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = articleIdSchema.parse(req.params); //유효성 검사
      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
      });
      res.json(article);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = articleIdSchema.parse(req.params); //유효성 검사
      const updateData = updateArticleSchema.parse(req.body); //유효성 검사

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
      }

      const article = await prisma.article.update({
        where: { id },
        data: updateData,
      });
      res.json(article);
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = articleIdSchema.parse(req.params); //유효성 검사
      await prisma.article.delete({
        where: { id },
      });
      res.sendStatus(204);
    }),
  );

router.use('/:articleId/comments', commentsRouter);

export default router;
