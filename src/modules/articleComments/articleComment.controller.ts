import { ArticleCommentService } from './articleComment.service.js';
import type { Response } from 'express';
import type {
  GetArticleCommentsRequest,
  GetArticleCommentByIdRequest,
  CreateArticleCommentRequest,
  UpdateArticleCommentRequest,
  DeleteArticleCommentRequest,
} from './articleComment.dto.js';

export class ArticleCommentController {
  constructor(private articleCommentService: ArticleCommentService) {}

  // 게시글 모든 댓글 조회
  public getArticleComments = async (req: GetArticleCommentsRequest, res: Response) => {
    const query = req.parsedQuery;

    const { articleId } = req.parsedParams;

    const articleComments = await this.articleCommentService.getArticleComments(query, articleId);
    return res.status(200).json({ success: true, data: articleComments });
  };

  // 게시글 특정 댓글 조회
  public getArticleCommentById = async (req: GetArticleCommentByIdRequest, res: Response) => {
    const { id } = req.parsedParams;

    const articleComment = await this.articleCommentService.getArticleCommentById(id);
    return res.status(200).json({ success: true, data: articleComment });
  };

  // 게시글 댓글 생성
  public createArticleComment = async (req: CreateArticleCommentRequest, res: Response) => {
    const { articleId } = req.parsedParams;

    const userId = req.user.id;

    const data = req.parsedBody;
    const articleComment = await this.articleCommentService.createArticleComment(articleId, userId, data);
    return res.status(201).json({ success: true, data: articleComment });
  };

  // 게시글 댓글 수정
  public updateArticleComment = async (req: UpdateArticleCommentRequest, res: Response) => {
    const { id } = req.parsedParams;

    const resource = req.resource;

    const data = req.parsedBody;
    const articleComment = await this.articleCommentService.updateArticleComment(id, data, resource);
    return res.status(200).json({ success: true, data: articleComment });
  };

  // 게시글 댓글 삭제
  public deleteArticleComment = async (req: DeleteArticleCommentRequest, res: Response) => {
    const { id } = req.parsedParams;

    await this.articleCommentService.deleteArticleComment(id);
    return res.status(200).json({ success: true, message: '댓글이 삭제되었습니다.' });
  };
}
