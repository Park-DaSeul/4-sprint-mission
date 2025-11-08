import { ProductService } from '../../../src/modules/products/product.service.js';
import { ProductRepository } from '../../../src/modules/products/product.repository.js';
import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { vi } from 'vitest';

// 가짜(mock) 객체 생성
const mockProductRepository = {
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
};

const mockNotificationService = {
  createNotifications: vi.fn(),
};

describe('ProductService 유닛 테스트', () => {
  let productService: ProductService;

  const userId = 'user-id-1';
  const productId = 'product-id-1';
  const productAuthorId1 = 'author-id-1';
  const productAuthorId2 = 'author-id-2';
  const resource = {
    id: productId,
    name: '기존 이름',
    description: '기존 설명',
    price: 1000,
    tags: ['태그1', '태그2'],
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    productService = new ProductService(
      mockProductRepository as unknown as ProductRepository,
      mockNotificationService as unknown as NotificationService,
    );
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 모든 상품 조회
  describe('getProducts', () => {
    it('(로그인 사용자) 상품 목록을 정상적으로 조회하고, isLiked 필드를 추가해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockProducts = [
        { id: 'product-1', title: '제목 1', productLikes: [{ id: 'like-1' }] },
        { id: 'product-2', title: '제목 2', productLikes: [] },
      ];
      mockProductRepository.getProducts.mockResolvedValue(mockProducts);

      // --- 실행 (Act) ---
      const result = await productService.getProducts({}, userId);

      // --- 검증 (Assert) ---
      expect(mockProductRepository.getProducts).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { id: 'product-1', title: '제목 1', isLiked: true },
        { id: 'product-2', title: '제목 2', isLiked: false },
      ]);
    });

    it('(비로그인 사용자) 상품 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockProducts = [
        { id: 'product-1', title: '제목 1', productLikes: [] },
        { id: 'product-2', title: '제목 2', productLikes: [] },
      ];
      mockProductRepository.getProducts.mockResolvedValue(mockProducts);

      // --- 실행 (Act) ---
      const result = await productService.getProducts({}, null);

      // --- 검증 (Assert) ---
      expect(mockProductRepository.getProducts).toHaveBeenCalledTimes(1);
      expect(result[0].isLiked).toBe(false);
    });

    it('오래된 순 정렬(order=old)이 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductRepository.getProducts.mockResolvedValue([]);

      // --- 실행 (Act) ---
      await productService.getProducts({ order: 'old' }, userId);

      const getQuery = {
        where: {},
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 10,
      };

      // --- 검증 (Assert) ---
      expect(mockProductRepository.getProducts).toHaveBeenCalledWith(
        expect.objectContaining(getQuery),
        expect.any(Object),
      );
    });

    it('검색어가 포함된 상품 목록을 올바르게 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const search = '검색';
      mockProductRepository.getProducts.mockResolvedValue([]);

      // --- 실행 (Act) ---
      await productService.getProducts({ search }, userId);

      const where = {
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      };

      // --- 검증 (Assert) ---
      expect(mockProductRepository.getProducts).toHaveBeenCalledWith(
        expect.objectContaining(where),
        expect.any(Object),
      );
    });
  });

  // 특정 상품 조회
  describe('getProductById', () => {
    it('특정 ID의 상품을 정상적으로 조회하고, isLiked 필드를 추가해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockProduct = {
        ...resource,
        productLikes: [{ id: 'like-1' }],
      };
      mockProductRepository.getProductById.mockResolvedValue(mockProduct);

      // --- 실행 (Act) ---
      const result = await productService.getProductById(productId, userId);

      // --- 검증 (Assert) ---
      expect(mockProductRepository.getProductById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.getProductById).toHaveBeenCalledWith(productId, userId);
      expect(result.isLiked).toBe(true);
    });

    it('존재하지 않는 상품 ID로 조회 시 NotFoundError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductRepository.getProductById.mockResolvedValue(null);

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(productService.getProductById('non-existent-id', userId)).rejects.toThrow(
        '상품을 찾을 수 없습니다.',
      );
    });
  });

  // 상품 생성
  describe('createProduct', () => {
    it('이미지를 포함하여 상품을 정상적으로 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        name: '테스트 이름',
        description: '테스트 설명',
        price: 1000,
        tags: ['태그1', '태그2'],
        imageIds: [{ id: 'image-1' }],
      };
      const mockCreatedProduct = {
        id: productId,
        ...data,
      };
      mockProductRepository.createProduct.mockResolvedValue(mockCreatedProduct);

      // --- 실행 (Act) ---
      const result = await productService.createProduct(userId, data);

      const createData = {
        name: data.name,
        description: data.description,
        price: data.price,
        tags: data.tags,
        user: {
          connect: { id: userId },
        },
        productImages: {
          connect: data.imageIds,
        },
      };

      // --- 검증 (Assert) ---
      expect(mockProductRepository.createProduct).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.createProduct).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  // 상품 수정
  describe('updateProduct', () => {
    it('상품을 정상적으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        name: '수정된 이름',
        description: '수정된 내용',
        price: 1000,
        tags: ['태그1', '태그2'],
      };
      const mockUpdatedProduct = {
        id: productId,
        ...data,
      };
      mockProductRepository.updateProduct.mockResolvedValue(mockUpdatedProduct);

      // --- 실행 (Act) ---
      const result = await productService.updateProduct(productId, userId, data, resource);

      const updateData = {
        name: data.name,
        description: data.description,
      };

      // --- 검증 (Assert) ---
      expect(mockProductRepository.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.updateProduct).toHaveBeenCalledWith(productId, updateData);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('상품의 가격을 수정 할때 좋아요를 누른 사용자에게 알림을 보내야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        name: '수정된 이름',
        description: '수정된 내용',
        price: 2000,
        tags: ['태그3', '태그4'],
      };
      const mockUpdatedProduct = {
        id: productId,
        ...data,
        productLikes: [{ userId: productAuthorId1 }, { userId: productAuthorId2 }],
      };
      mockProductRepository.updateProduct.mockResolvedValue(mockUpdatedProduct);

      // --- 실행 (Act) ---
      const result = await productService.updateProduct(productId, userId, data, resource);

      const updateData = {
        name: data.name,
        description: data.description,
        price: data.price,
        tags: data.tags,
      };

      // --- 검증 (Assert) ---
      expect(mockProductRepository.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.updateProduct).toHaveBeenCalledWith(productId, updateData);

      // 알림 확인
      expect(mockNotificationService.createNotifications).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createNotifications).toHaveBeenCalledWith([
        {
          recipientId: productAuthorId1,
          senderId: userId,
          entityId: productId,
          type: 'PRODUCT_PRICE_CHANGE',
          message: '당신이 ‘좋아요’ 누른 상품의 가격이 변경됐어요.',
        },
        {
          recipientId: productAuthorId2,
          senderId: userId,
          entityId: productId,
          type: 'PRODUCT_PRICE_CHANGE',
          message: '당신이 ‘좋아요’ 누른 상품의 가격이 변경됐어요.',
        },
      ]);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('수정할 내용이 없을 때 BadRequestError를 던져야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        name: resource.name,
        description: resource.description,
        price: resource.price,
        tags: resource.tags,
      };

      // --- 실행 및 검증 (Act & Assert) ---
      await expect(productService.updateProduct(productId, userId, data, resource)).rejects.toThrow(
        '수정할 내용이 없습니다.',
      );
    });
  });

  // 상품 삭제
  describe('deleteProduct', () => {
    it('상품을 정상적으로 삭제해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockProductRepository.deleteProduct.mockResolvedValue({ id: productId });

      // --- 실행 (Act) ---
      await productService.deleteProduct(productId);

      // --- 검증 (Assert) ---
      expect(mockProductRepository.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.deleteProduct).toHaveBeenCalledWith(productId);
    });
  });
});
