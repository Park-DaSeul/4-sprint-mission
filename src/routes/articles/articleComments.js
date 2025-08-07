import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  createArticleCommentSchema,
  updateArticleCommentSchema,
  articleCommentParamsSchema,
} from '../../schemas/articles/articleCommentSchema.js';
import { articleParamSchema } from '../../schemas/articles/articleSchema.js';

const prisma = new PrismaClient();
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const { articleId } = articleParamSchema.parse(req.params); //유효성 검사
      const { cursor, take = 10 } = req.query;
      //coursor 방식의 페이지 네이션
      const findManyArgs = {
        where: { articleId },
        take: parseInt(take),
        orderBy: { createdAt: 'desc' },
      };

      if (cursor) {
        findManyArgs.cursor = { id: cursor };
        findManyArgs.skip = 1;
      }

      const comments = await prisma.articleComment.findMany(findManyArgs);
      const nextCursor =
        comments.length === parseInt(take)
          ? comments[comments.length - 1].id
          : null;

      res.json({
        data: comments,
        nextCursor,
      });
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const { articleId } = articleParamSchema.parse(req.params); //유효성 검사
      const newData = createArticleCommentSchema.parse(req.body); //유효성 검사
      const comment = await prisma.articleComment.create({
        data: {
          articleId,
          ...newData,
        },
      });
      res.status(201).json(comment);
    }),
  );

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { articleId, id } = articleCommentParamsSchema.parse(req.params); //유효성 검사
      const comment = await prisma.articleComment.findFirstOrThrow({
        where: { articleId, id },
      });
      res.json(comment);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { articleId, id } = articleCommentParamsSchema.parse(req.params); //유효성 검사
      const updateData = updateArticleCommentSchema.parse(req.body); //유효성 검사

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
      }

      const comment = await prisma.articleComment.update({
        where: { articleId, id },
        data: updateData,
      });
      res.json(comment);
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { articleId, id } = articleCommentParamsSchema.parse(req.params); //유효성 검사
      await prisma.articleComment.delete({
        where: { articleId, id },
      });
      res.sendStatus(204);
    }),
  );

export default router;
