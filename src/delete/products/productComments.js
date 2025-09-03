import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  createProductCommentSchema,
  updateProductCommentSchema,
  productCommentParamsSchema,
} from '../schemas/products/productCommentSchema.js';
import { productParamSchema } from '../schemas/products/productSchema.js';

const prisma = new PrismaClient();
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const { productId } = productParamSchema.parse(req.params); //유효성 검사
      const { cursor, take = 10 } = req.query;
      //coursor 방식의 페이지 네이션
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
      const nextCursor = comments.length === parseInt(take) ? comments[comments.length - 1].id : null;

      res.json({
        data: comments,
        nextCursor,
      });
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const { productId } = productParamSchema.parse(req.params); //유효성 검사
      const newData = createProductCommentSchema.parse(req.body); //유효성 검사
      const comment = await prisma.productComment.create({
        data: {
          productId,
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
      const { productId, id } = productCommentParamsSchema.parse(req.params); //유효성 검사
      const comment = await prisma.productComment.findFirstOrThrow({
        where: { productId, id },
      });
      res.json(comment);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { productId, id } = productCommentParamsSchema.parse(req.params); //유효성 검사
      const updateData = updateProductCommentSchema.parse(req.body); //유효성 검사

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
      const { productId, id } = productCommentParamsSchema.parse(req.params); //유효성 검사
      await prisma.productComment.delete({
        where: { productId, id },
      });
      res.sendStatus(204);
    }),
  );

export default router;
