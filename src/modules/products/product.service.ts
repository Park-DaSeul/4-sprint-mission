import { ProductRepository } from './product.repository.js';
import type { Prisma, Product } from '@prisma/client';
import type { CreateProductBody, UpdateProductBody } from './product.dto.js';
import type { OffsetQuery } from '../../common/index.js';
import { NotificationService } from '../notifications/notification.service.js';
import type { CreateNotificationBody } from '../notifications/notification.dto.js';
import { NotFoundError, BadRequestError } from '../../utils/errorClass.js';
import { getFileUrl, moveFileToPermanent } from '../../lib/s3-service.js';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private notificationService: NotificationService,
  ) {}

  // 모든 상품 조회
  public getProducts = async (query: OffsetQuery, userId: string | null) => {
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

    // where 조건 추가
    let where: Prisma.ProductWhereInput = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // userId가 유효할 때만 필터를 적용하는 객체 생성
    const likesQuery: Prisma.ProductInclude = userId
      ? {
          productLikes: {
            where: { userId },
            select: {
              id: true,
            },
          },
        }
      : {};

    // query 구성 (페이지 네이션, 정렬 포함)
    const getQuery: Prisma.ProductFindManyArgs = {
      where,
      orderBy,
      skip,
      take,
    };

    const products = await this.productRepository.getProducts(getQuery, likesQuery);

    // 데이터 가공
    // isLiked로 좋아요를 불리언 값으로 변환
    const productsData = products.map(({ productLikes, ...rest }) => ({
      ...rest,
      isLiked: productLikes?.length > 0,
    }));

    return productsData;
  };

  // 특정 상품 조회
  public getProductById = async (id: string, userId: string) => {
    const product = await this.productRepository.getProductById(id, userId);
    if (!product) throw new NotFoundError('상품을 찾을 수 없습니다.');

    // 데이터 가공
    // isLiked로 좋아요를 불리언 값으로 변환
    const { productLikes, ...rest } = product;
    const productData = {
      ...rest,
      isLiked: product.productLikes.length > 0,
    };

    return productData;
  };

  // 상품 생성
  public createProduct = async (userId: string, data: CreateProductBody) => {
    const { name, description, price, tags, imageKeys } = data;

    // S3 파일 이동
    const imagesData = await Promise.all(
      imageKeys.map(async (tempKey) => {
        const permanentKey = await moveFileToPermanent(tempKey, 'products');
        const fileUrl = getFileUrl(permanentKey);
        return { key: permanentKey, fileUrl };
      }),
    );

    const createData: Prisma.ProductCreateInput = {
      name,
      description,
      price,
      tags,
      user: {
        connect: { id: userId },
      },
      productImages: {
        create: imagesData,
      },
    };

    const product = await this.productRepository.createProduct(createData);

    return product;
  };

  // 상품 수정
  public updateProduct = async (id: string, userId: string, data: UpdateProductBody, resource: Product) => {
    const { name, description, price, tags } = data;

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.ProductUpdateInput = {
      ...(name !== resource.name && { name }),
      ...(description !== resource.description && { description }),
      ...(price !== resource.price && { price }),
      ...(JSON.stringify(tags) !== JSON.stringify(resource.tags) && { tags }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('수정할 내용이 없습니다.');
    }

    const product = await this.productRepository.updateProduct(id, updateData);

    // 알림 생성
    if (price !== resource.price) {
      const recipientIds: string[] = product.productLikes.map((like) => like.userId);

      const notificationData: CreateNotificationBody[] = recipientIds.map((recipientId) => ({
        recipientId: recipientId,
        senderId: userId,
        entityId: product.id,
        type: 'PRODUCT_PRICE_CHANGE',
        message: '당신이 ‘좋아요’ 누른 상품의 가격이 변경됐어요.',
      }));

      await this.notificationService.createNotifications(notificationData);
    }

    return product;
  };

  // 상품 삭제
  public deleteProduct = async (id: string) => {
    return await this.productRepository.deleteProduct(id);
  };
}
