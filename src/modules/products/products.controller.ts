import * as productService from './products.service.js';
import type { Request, Response } from 'express';

// 모든 상품 조회
export const getProducts = async (req: Request, res: Response) => {
  const query = req.query;

  const userId = req.user ? req.user.id : null;

  const products = await productService.getProducts(query, userId);
  return res.json({ success: true, data: products });
};

// 특정 상품 조회
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('상품 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const product = await productService.getProductById(id, userId);
  return res.json({ success: true, data: product });
};

// 상품 생성
export const createProduct = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const data = req.body;
  const product = await productService.createProduct(userId, data);
  return res.status(201).json({ success: true, data: product });
};

// 상품 수정
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('상품 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const data = req.body;
  const product = await productService.updateProduct(id, userId, data);
  return res.json({ success: true, data: product });
};

// 상품 삭제
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('상품 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  await productService.deleteProduct(id, userId);
  return res.status(200).json({ success: true, message: '상품이 삭제되었습니다.' });
};
