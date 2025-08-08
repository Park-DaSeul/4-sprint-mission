import { PrismaClient } from '@prisma/client';
import { createProductSchema } from '../src/schemas/products/productSchema.js';
import { createArticleSchema } from '../src/schemas/articles/articleSchema.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 시드 데이터 생성을 시작합니다. ---');
  try {
    // db 초기화
    await prisma.product.deleteMany();
    await prisma.article.deleteMany();
    // 상품(Products) 데이터 생성
    const products = [
      {
        name: '첫 번째 상품',
        description: '이 상품은 테스트용으로 생성되었습니다.',
        price: 15000,
        tags: ['신상', '인기'],
        image: 'uploads/products/1678886400000-product1.png',
      },
      {
        name: '두 번째 상품',
        description: '이 상품은 특별 할인가로 판매 중입니다.',
        price: 25000,
        tags: ['할인', '한정판'],
        image: 'uploads/products/1678886400001-product2.png',
      },
      {
        name: '세 번째 상품',
        description: '고객에게 가장 인기 있는 상품입니다.',
        price: 35000,
        tags: ['추천', '베스트'],
      },
    ];
    for (const product of products) {
      createProductSchema.parse(product);
      await prisma.product.create({ data: product });
    }
    console.log('✅ 상품 데이터가 성공적으로 시드되었습니다.');

    // 게시글(Articles) 데이터 생성
    const articles = [
      {
        title: '첫 번째 게시글',
        content: '이 게시글은 시드 파일로 생성되었습니다.',
        image: 'uploads/articles/1678886400000-article1.png',
      },
      {
        title: '두 번째 게시글',
        content: '새로운 소식과 정보를 담고 있습니다.',
        image: 'uploads/articles/1678886400001-article2.png',
      },
      {
        title: '세 번째 게시글',
        content: '어떤 주제든 자유롭게 이야기해 보세요.',
      },
    ];
    for (const article of articles) {
      createArticleSchema.parse(article);
      await prisma.article.create({ data: article });
    }
    console.log('✅ 게시글 데이터가 성공적으로 시드되었습니다.');
  } catch (e) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('--- 시드 데이터 생성이 완료되었습니다. ---');
  }
}

main();
