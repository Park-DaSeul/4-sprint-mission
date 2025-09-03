import * as commentService from '../services/comment.service.js';

// 모든 댓글 조회
export const getComments = async (req, res) => {
  const { articleId, productId } = req.params;
  const query = req.query;
  const comments = await commentService.getComments({ articleId, productId, ...query });
  res.json({ success: true, data: comments });
};

// 특정 댓글 조회
export const getCommentById = async (req, res) => {
  const { id } = req.params;
  const comment = await commentService.getCommentById(id);
  res.json({ success: true, data: comment });
};

// 댓글 생성
export const createComment = async (req, res) => {
  const { articleId, productId } = req.params;
  const data = req.body;
  const userId = req.user.id; // 인증 미들웨어에서 설정된 사용자 ID
  const comment = await commentService.createComment(userId, { articleId, productId, ...data });
  res.status(201).json({ success: true, data: comment });
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req.user.id; // 인증 미들웨어에서 설정된 사용자 ID
  const comment = await commentService.updateComment(id, userId, data);
  res.json({ success: true, data: comment });
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 인증 미들웨어에서 설정된 사용자 ID
  await commentService.deleteComment(id, userId);
  res.status(200).json({ success: true, message: '댓글이 삭제되었습니다.' });
};
