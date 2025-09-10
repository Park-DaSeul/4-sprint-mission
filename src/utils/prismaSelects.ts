import type { Prisma } from '@prisma/client';

// auth + user
export const meSelect = {
  id: true,
  email: true,
  nickname: true,
  imageUrl: true,
} satisfies Prisma.UserSelect;

export const userSelect = {
  nickname: true,
} satisfies Prisma.UserSelect;

// article
export const articleSelect = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

// product
export const productSelect = {
  id: true,
  productName: true,
  description: true,
  price: true,
  tags: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

// comment
export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CommentSelect;

// articltLike
export const articleLikeSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleLikeSelect;

// productLike
export const productLikeSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductLikeSelect;
