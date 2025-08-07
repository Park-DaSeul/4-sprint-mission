import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import commentsRouter from './articleComments.js';
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
} from '../../schemas/articles/articleSchema.js';
import { uploadArticleImage } from '../../utils/uploads/articleUpload.js';

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
      //검색 기능 추가
      const searchKeyword = req.query.search;
      let where = {};

      if (searchKeyword) {
        where = {
          OR: [
            { title: { contains: searchKeyword, mode: 'insensitive' } },
            { content: { contains: searchKeyword, mode: 'insensitive' } },
          ],
        };
      }

      const articles = await prisma.article.findMany({
        where,
        orderBy,
        skip: parseInt(offset),
        take: parseInt(limit),
      });
      res.json(articles);
    }),
  )
  .post(
    uploadArticleImage.single('image'),
    asyncHandler(async (req, res) => {
      const newData = createArticleSchema.parse(req.body); //유효성 검사
      const imagePath = req.file ? req.file.path : null; //이미지파일 검사

      const article = await prisma.article.create({
        data: {
          image: imagePath,
          ...newData,
        },
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
