import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 시드 데이터 생성을 시작합니다. ---');

  try {
    // 사용자 생성
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        nickname: '테니스',
        password: hashedPassword,
      },
    });
    console.log(`✅ 사용자 생성: ${user.nickname}`);

    // 상품 데이터 생성
    const products = [
      {
        name: '첫 번째 상품',
        description: '이 상품은 테스트용으로 생성되었습니다.',
        price: 15000,
        tags: ['신상', '인기'],
        userId: user.id,
        productImages: {
          create: [
            {
              fileUrl: 'uploads/products/1678886400000-product1.png',
              key: 'product1_public_id',
            },
          ],
        },
      },
      {
        name: '두 번째 상품',
        description: '이 상품은 특별 할인가로 판매 중입니다.',
        price: 25000,
        tags: ['할인', '한정판'],
        userId: user.id,
        productImages: {
          create: [
            {
              fileUrl: 'uploads/products/1678886400001-product2.png',
              key: 'product2_public_id',
            },
          ],
        },
      },
      {
        name: '세 번째 상품',
        description: '고객에게 가장 인기 있는 상품입니다.',
        price: 35000,
        tags: ['추천', '베스트'],
        userId: user.id,
      },
    ];

    for (const productData of products) {
      await prisma.product.create({ data: productData });
    }
    console.log('✅ 상품 데이터가 성공적으로 시드되었습니다.');

    // 게시글 데이터 생성
    const articles = [
      {
        title: '첫 번째 게시글',
        content: '이 게시글은 시드 파일로 생성되었습니다.',
        userId: user.id,
        articleImages: {
          create: [
            {
              fileUrl: 'uploads/articles/1678886400000-article1.png',
              key: 'article1_public_id',
            },
          ],
        },
      },
      {
        title: '두 번째 게시글',
        content: '새로운 소식과 정보를 담고 있습니다.',
        userId: user.id,
        articleImages: {
          create: [
            {
              fileUrl: 'uploads/articles/1678886400001-article2.png',
              key: 'article2_public_id',
            },
          ],
        },
      },
      {
        title: '세 번째 게시글',
        content: '어떤 주제든 자유롭게 이야기해 보세요.',
        userId: user.id,
      },
    ];

    for (const articleData of articles) {
      await prisma.article.create({ data: articleData });
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
