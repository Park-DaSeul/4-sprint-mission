import { ProductCommentService } from './productComment.service.js';
import type { Response } from 'express';
import type {
  GetProductCommentsRequest,
  GetProductCommentByIdRequest,
  CreateProductCommentRequest,
  UpdateProductCommentRequest,
  DeleteProductCommentRequest,
} from './productComment.dto.js';

export class ProductCommentController {
  constructor(private productCommentService: ProductCommentService) {}

  // 상품 모든 댓글 조회
  public getProductComments = async (req: GetProductCommentsRequest, res: Response) => {
    const query = req.parsedQuery;

    const { productId } = req.parsedParams;

    const productComments = await this.productCommentService.getProductComments(query, productId);
    return res.status(200).json({ success: true, data: productComments });
  };

  // 상품 특정 댓글 조회
  public getProductCommentById = async (req: GetProductCommentByIdRequest, res: Response) => {
    const { id } = req.parsedParams;

    const productComment = await this.productCommentService.getProductCommentById(id);
    return res.status(200).json({ success: true, data: productComment });
  };

  // 상품 댓글 생성
  public createProductComment = async (req: CreateProductCommentRequest, res: Response) => {
    const { productId } = req.parsedParams;

    const userId = req.user.id;

    const data = req.parsedBody;
    const productComment = await this.productCommentService.createProductComment(productId, userId, data);
    return res.status(201).json({ success: true, data: productComment });
  };

  // 상품 댓글 수정
  public updateProductComment = async (req: UpdateProductCommentRequest, res: Response) => {
    const { id } = req.parsedParams;

    const resource = req.resource;

    const data = req.parsedBody;
    const productComment = await this.productCommentService.updateProductComment(id, data, resource);
    return res.status(200).json({ success: true, data: productComment });
  };

  // 상품 댓글 삭제
  public deleteProductComment = async (req: DeleteProductCommentRequest, res: Response) => {
    const { id } = req.parsedParams;

    await this.productCommentService.deleteProductComment(id);
    return res.status(200).json({ success: true, message: '댓글이 삭제되었습니다.' });
  };
}
