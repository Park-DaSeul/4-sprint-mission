import { ProductCommentRepository } from './productComment.repository.js';
import type { Prisma, ProductComment } from '@prisma/client';
import type { CreateProductCommentBody, UpdateProductCommentBody } from './productComment.dto.js';
import type { CursorQuery } from '../../common/index.js';
import { NotificationService } from '../notifications/notification.service.js';
import type { CreateNotificationBody } from '../notifications/notification.dto.js';
import { NotFoundError, BadRequestError } from '../../utils/errorClass.js';

export class ProductCommentService {
  constructor(
    private productCommentRepository: ProductCommentRepository,
    private notificationService: NotificationService,
  ) {}

  // 상품 모든 댓글 조회
  public getProductComments = async (query: CursorQuery, productId: string) => {
    const { limit: take = 10, cursor, search } = query;

    // 페이지 네이션 커서방식
    const searchFilter: Prisma.ProductCommentWhereInput = search
      ? {
          OR: [{ content: { contains: search, mode: 'insensitive' } }],
        }
      : {};

    // where 조건 추가
    const where: Prisma.ProductCommentWhereInput = {
      productId,
      ...searchFilter,
    };

    // query 구성
    const getQuery: Prisma.ProductCommentFindManyArgs = {
      where,
      take,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    };

    const productComments = await this.productCommentRepository.getProductComments(getQuery);

    const lastProductCommentInResults = productComments[productComments.length - 1];
    const nextCursor = lastProductCommentInResults ? lastProductCommentInResults.id : null;

    const productCommentsData = {
      productComments,
      nextCursor,
    };

    return productCommentsData;
  };

  // 상품 특정 댓글 조회
  public getProductCommentById = async (id: string) => {
    const productComment = await this.productCommentRepository.getProductCommentById(id);
    if (!productComment) throw new NotFoundError('댓글을 찾을 수 없습니다.');

    return productComment;
  };

  // 상품 댓글 생성
  public createProductComment = async (productId: string, userId: string, data: CreateProductCommentBody) => {
    const { content } = data;

    const createData: Prisma.ProductCommentCreateInput = {
      content,
      product: {
        connect: { id: productId },
      },
      user: {
        connect: { id: userId },
      },
    };

    const productComment = await this.productCommentRepository.createProductComment(createData);

    // 알림 생성
    if (productComment.product.user.id !== userId) {
      const notificationData: CreateNotificationBody = {
        recipientId: productComment.product.user.id,
        senderId: userId,
        entityId: productComment.product.id,
        type: 'PRODUCT_COMMENT',
        message: '누군가 당신의 상품에 댓글을 남겼어요.',
      };

      await this.notificationService.createNotification(notificationData);
    }

    return productComment;
  };

  // 상품 댓글 수정
  public updateProductComment = async (id: string, data: UpdateProductCommentBody, resource: ProductComment) => {
    const { content } = data;

    // 기존 데이터와 새 데이터 비교
    const updateData: Prisma.ProductCommentUpdateInput = {
      ...(content !== resource.content && { content }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('수정할 내용이 없습니다.');
    }

    const productComment = await this.productCommentRepository.updateProductComment(id, updateData);

    return productComment;
  };

  // 상품 댓글 삭제
  public deleteProductComment = async (id: string) => {
    return await this.productCommentRepository.deleteProductComment(id);
  };
}
