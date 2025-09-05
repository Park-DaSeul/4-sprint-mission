import * as productService from '../services/product.service.js';

// 모든 상품 조회
export const getProducts = async (req, res) => {
  const query = req.query;
  const userId = req.user ? req.user.id : null;
  const products = await productService.getProducts(query, userId);
  res.json({ success: true, data: products });
};

// 특정 상품 조회
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const product = await productService.getProductById(id, userId);
  res.json({ success: true, data: product });
};

// 상품 생성
export const createProduct = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const product = await productService.createProduct(userId, data);
  res.status(201).json({ success: true, data: product });
};

// 상품 수정
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;
  const product = await productService.updateProduct(id, userId, data);
  res.json({ success: true, data: product });
};

// 상품 삭제
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  await productService.deleteProduct(id, userId);
  res.status(200).json({ success: true, message: '상품이 삭제되었습니다.' });
};
