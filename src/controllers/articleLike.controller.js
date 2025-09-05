import * as articleLikeService from '../services/articleLike.service.js';

// 게시글 좋아요 생성 (토글)
export const createArticleLike = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user.id;
  const articleLike = await articleLikeService.createArticleLike(articleId, userId);

  if (typeof articleLike === 'string' && articleLike === 'canseled') {
    return res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' });
  }

  res.status(201).json({ success: true, data: articleLike });
};
