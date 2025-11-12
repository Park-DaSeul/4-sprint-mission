import { ArticleLikeService } from './articleLike.service.js';
import type { Response } from 'express';
import type { createArticleLikeRequest } from './articleLike.dto.js';

export class ArticleLikeController {
  constructor(private articleLikeService: ArticleLikeService) {}

  // 게시글 좋아요 생성 (토글)
  public createArticleLike = async (req: createArticleLikeRequest, res: Response) => {
    const { articleId } = req.parsedParams;

    const userId = req.user.id;

    const articleLike = await this.articleLikeService.createArticleLike(articleId, userId);

    // 좋아요 취소일 경우와 생성일 경우를 삼항 연산자로 처리
    return articleLike === null
      ? res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' })
      : res.status(201).json({ success: true, data: articleLike });
  };
}
