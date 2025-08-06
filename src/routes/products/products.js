import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import commentsRouter from './productComments.js';

const prisma = new PrismaClient();
const router = express.Router();

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const { offset = 0, limit = 10, order = 'recent' } = req.query;
      let orderBy;
      switch (order) {
        case 'old':
          orderBy = { createdAt: 'asc' };
          break;
        case 'recent':
        default:
          orderBy = { createdAt: 'desc' };
      }
      const products = await prisma.product.findMany({
        orderBy,
        skip: parseInt(offset),
        take: parseInt(limit),
      });
      res.json(products);
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const { name, description, price, tags } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          tags: tags || [],
        },
      });
      res.status(201).json(product);
    }),
  );

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const product = await prisma.product.findUniqueOrThrow({
        where: { id },
      });
      res.json(product);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { name, description, price, tags } = req.body;
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (tags !== undefined) updateData.tags = tags;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      res.json(product);
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id },
      });
      res.sendStatus(204);
    }),
  );

router.use('/:productId/comments', commentsRouter);

export default router;
