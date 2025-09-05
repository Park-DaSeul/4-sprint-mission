import * as productLikeService from '../services/productLike.service.js';

// 게시글 좋아요 생성 (토글)
export const createProductLike = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const productLike = await productLikeService.createProductLike(productId, userId);

  if (typeof productLike === 'string' && productLike === 'canseled') {
    return res.status(200).json({ success: true, message: '좋아요를 취소했습니다.' });
  }

  res.status(201).json({ success: true, data: productLike });
};
