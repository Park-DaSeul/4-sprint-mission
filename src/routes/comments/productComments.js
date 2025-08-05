import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';

const prisma = new PrismaClient();
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const { productId } = req.params;
      const { cursor, take = 10 } = req.query;

      const findManyArgs = {
        where: { productId },
        take: parseInt(take),
        orderBy: { createdAt: 'desc' },
      };

      if (cursor) {
        findManyArgs.cursor = { id: cursor };
        findManyArgs.skip = 1;
      }

      const comments = await prisma.productComment.findMany(findManyArgs);
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
      const { productId } = req.params;
      const { content } = req.body;
      const comment = await prisma.productComment.create({
        data: {
          productId,
          content,
        },
      });
      res.status(201).json(comment);
    }),
  );

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { productId, id } = req.params;
      const comment = await prisma.productComment.findFirstOrThrow({
        where: { productId, id },
      });
      res.json(comment);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { productId, id } = req.params;
      const { content } = req.body;
      const updateData = {};
      if (content !== undefined) updateData.content = content;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
      }

      const comment = await prisma.productComment.update({
        where: { productId, id },
        data: updateData,
      });
      res.json(comment);
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { productId, id } = req.params;
      await prisma.productComment.delete({
        where: { productId, id },
      });
      res.sendStatus(204);
    }),
  );

export default router;
