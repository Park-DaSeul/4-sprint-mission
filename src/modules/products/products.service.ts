import * as productRepository from './products.repository.js';
import type { Prisma } from '@prisma/client';
import type {
  GetProductsQuery,
  GetProductsRepositoryQuery,
  CreateProductData,
  CreateProductRepositoryData,
  UpdateProductData,
} from './products.dto.js';
import { deleteFile } from '../../utils/index.js';

// 모든 상품 조회
export const getProducts = async (query: GetProductsQuery, userId: string | null) => {
  const { offset: skip = 0, limit: take = 10, order = 'recent', search } = query;

  // 페이지 네이션 offset 방식
  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (order) {
    case 'old':
      orderBy = { createdAt: 'asc' };
      break;
    case 'recent':
    default:
      orderBy = { createdAt: 'desc' };
  }

  // 검색 기능 추가
  let where: Prisma.ProductWhereInput = {};
  if (search) {
    where = {
      OR: [
        { productName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // userId가 유효할 때만 필터를 적용하는 객체 생성
  const likesQuery: Prisma.ProductInclude = userId ? { likes: { where: { userId }, select: { id: true } } } : {};
  const productsQuery: GetProductsRepositoryQuery = { where, orderBy, skip, take };

  const products = await productRepository.getProducts(productsQuery, likesQuery);

  // isLiked로 좋아요를 불리언 값으로 변환
  const productsData = products.map((product) => {
    const isLiked = product.likes?.length > 0;
    // likes 필드를 제거하고 isLiked 필드를 추가
    const { likes, ...rest } = product;
    return { ...rest, isLiked };
  });

  return productsData;
};

// 특정 상품 조회
export const getProductById = async (id: string, userId: string) => {
  const product = await productRepository.getProductById(id, userId);
  if (!product) throw new Error('상품을 찾을 수 없습니다.');

  // isLiked로 좋아요를 불리언 값으로 변환
  const isLiked = product.likes.length > 0;
  // likes 필드를 제거하고 isLiked 필드를 추가
  const { likes, ...rest } = product;
  const productData = { ...rest, isLiked };

  return productData;
};

// 상품 생성
export const createProduct = async (userId: string, data: CreateProductData) => {
  const { productName, description, price, tags, imageUrl } = data;

  const createData: CreateProductRepositoryData = {
    productName,
    description,
    price,
    tags,
    imageUrl,
    userId,
  };

  const product = await productRepository.createProduct(createData);

  return product;
};

// 상품 수정
export const updateProduct = async (id: string, userId: string, data: UpdateProductData) => {
  const { productName, description, price, tags } = data;

  // 상품이 존재 확인
  const productData = await productRepository.findProduct(id);
  if (!productData) throw new Error('상품을 찾을 수 없습니다.');
  if (productData.userId !== userId) throw new Error('상품을 수정할 권한이 없습니다.');

  // 기존 데이터와 새 데이터 비교
  const updateData: Partial<UpdateProductData> = {
    ...(productName !== productData.productName && { productName }),
    ...(description !== productData.description && { description }),
    ...(price !== productData.price && { price }),
    ...(JSON.stringify(tags) !== JSON.stringify(productData.tags) && { tags }),
  };

  if (Object.keys(updateData).length === 0) {
    throw new Error('수정할 내용이 없습니다.');
  }

  const product = await productRepository.updateProduct(id, updateData);

  return product;
};

// 상품 삭제
export const deleteProduct = async (id: string, userId: string) => {
  // 상품 존재 확인
  const productData = await productRepository.findProduct(id);
  if (!productData) throw new Error('상품을 찾을 수 없습니다.');
  if (productData.userId !== userId) throw new Error('상품을 삭제할 권한이 없습니다.');

  await productRepository.deleteProduct(id);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (productData.imageUrl) {
    await deleteFile(productData.imageUrl);
  }

  return;
};

// 상품 이미지 수정
export const updateProductImage = async (id: string, userId: string, imageUrl: string) => {
  // 상품 존재 확인
  const productData = await productRepository.findProduct(id);
  if (!productData) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('상품을 찾을 수 없습니다.');
  }
  if (productData.userId !== userId) {
    if (imageUrl) await deleteFile(imageUrl);
    throw new Error('상품을 수정할 권한이 없습니다.');
  }
  if (!imageUrl) throw new Error('수정할 이미지가 없습니다.');

  const updateData = { imageUrl };

  const product = await productRepository.updateProductImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (productData.imageUrl) {
    await deleteFile(productData.imageUrl);
  }

  return product;
};

// 상품 이미지 삭제
export const deleteProductImage = async (id: string, userId: string) => {
  // 상품 존재 확인
  const productData = await productRepository.findProduct(id);
  if (!productData) throw new Error('상품을 찾을 수 없습니다.');
  if (productData.userId !== userId) throw new Error('상품을 수정할 권한이 없습니다.');

  const updateData = { imageUrl: null };

  await productRepository.updateProductImage(id, updateData);

  // DB 업데이트 성공 후 기존 이미지 파일 삭제
  if (productData.imageUrl) {
    await deleteFile(productData.imageUrl);
  }

  return;
};
