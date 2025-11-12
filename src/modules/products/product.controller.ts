import { ProductService } from './product.service.js';
import type { Response } from 'express';
import type {
  GetProductsRequest,
  GetProductByIdRequest,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductRequest,
} from './product.dto.js';

export class ProductController {
  constructor(private productService: ProductService) {}

  // 모든 상품 조회
  public getProducts = async (req: GetProductsRequest, res: Response) => {
    const query = req.parsedQuery;

    const userId = req.user?.id ?? null;

    const products = await this.productService.getProducts(query, userId);
    return res.json({ success: true, data: products });
  };

  // 특정 상품 조회
  public getProductById = async (req: GetProductByIdRequest, res: Response) => {
    const { id } = req.parsedParams;

    const userId = req.user.id;

    const product = await this.productService.getProductById(id, userId);
    return res.json({ success: true, data: product });
  };

  // 상품 생성
  public createProduct = async (req: CreateProductRequest, res: Response) => {
    const userId = req.user.id;

    const data = req.parsedBody;
    const product = await this.productService.createProduct(userId, data);
    return res.status(201).json({ success: true, data: product });
  };

  // 상품 수정
  public updateProduct = async (req: UpdateProductRequest, res: Response) => {
    const { id } = req.parsedParams;

    const userId = req.user.id;

    const resource = req.resource;

    const data = req.body;
    const product = await this.productService.updateProduct(id, userId, data, resource);
    return res.json({ success: true, data: product });
  };

  // 상품 삭제
  public deleteProduct = async (req: DeleteProductRequest, res: Response) => {
    const { id } = req.parsedParams;

    await this.productService.deleteProduct(id);
    return res.status(200).json({ success: true, message: '상품이 삭제되었습니다.' });
  };
}
