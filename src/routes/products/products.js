import express, { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import asyncHandler from '../../utils/asyncHandler.js';
import commentsRouter from './productComments.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../../schemas/products/productSchema.js';
import { uploadProductImage } from '../../utils/uploads/productUpload.js';

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
            { name: { contains: searchKeyword, mode: 'insensitive' } },
            { description: { contains: searchKeyword, mode: 'insensitive' } },
          ],
        };
      }

      const products = await prisma.product.findMany({
        where,
        orderBy,
        skip: parseInt(offset),
        take: parseInt(limit),
      });
      res.json(products);
    }),
  )
  .post(
    uploadProductImage.single('image'),
    asyncHandler(async (req, res) => {
      const newData = createProductSchema.parse(req.body); //유효성 검사
      const imagePath = req.file ? req.file.path : null; //이미지파일 검사

      const product = await prisma.product.create({
        data: {
          image: imagePath,
          ...newData,
        },
      });
      res.status(201).json(product);
    }),
  );

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = productIdSchema.parse(req.params); //유효성 검사
      const product = await prisma.product.findUniqueOrThrow({
        where: { id },
      });
      res.json(product);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = productIdSchema.parse(req.params); //유효성 검사
      const updateData = updateProductSchema.parse(req.body); //유효성 검사

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
      const { id } = productIdSchema.parse(req.params); //유효성 검사
      await prisma.product.delete({
        where: { id },
      });
      res.sendStatus(204);
    }),
  );

router.use('/:productId/comments', commentsRouter);

export default router;
