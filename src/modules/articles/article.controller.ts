import { ArticleService } from './article.service.js';
import type { Response } from 'express';
import type {
  GetArticlesRequest,
  GetArticleByIdRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
  DeleteArticleRequest,
} from './article.dto.js';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  // 모든 게시글 조회
  public getArticles = async (req: GetArticlesRequest, res: Response) => {
    const query = req.parsedQuery;

    const userId = req.user?.id ?? null;

    const articles = await this.articleService.getArticles(query, userId);
    return res.status(200).json({ success: true, data: articles });
  };

  // 특정 게시글 조회
  public getArticleById = async (req: GetArticleByIdRequest, res: Response) => {
    const { id } = req.parsedParams;

    const userId = req.user.id;

    const article = await this.articleService.getArticleById(id, userId);
    return res.status(200).json({ success: true, data: article });
  };

  // 게시글 생성
  public createArticle = async (req: CreateArticleRequest, res: Response) => {
    const userId = req.user.id;

    const data = req.parsedBody;
    const article = await this.articleService.createArticle(userId, data);
    return res.status(201).json({ success: true, data: article });
  };

  // 게시글 수정
  public updateArticle = async (req: UpdateArticleRequest, res: Response) => {
    const { id } = req.parsedParams;

    const resource = req.resource;

    const data = req.body;
    const article = await this.articleService.updateArticle(id, data, resource);
    return res.status(200).json({ success: true, data: article });
  };

  // 게시글 삭제
  public deleteArticle = async (req: DeleteArticleRequest, res: Response) => {
    const { id } = req.parsedParams;

    await this.articleService.deleteArticle(id);
    return res.status(200).json({ success: true, message: '게시글이 삭제되었습니다.' });
  };
}
