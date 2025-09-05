import * as articleService from '../services/article.service.js';

// 모든 게시글 조회
export const getArticles = async (req, res) => {
  const query = req.query;
  const userId = req.user ? req.user.id : null;
  const articles = await articleService.getArticles(query, userId);
  res.json({ success: true, data: articles });
};

// 특정 게시글 조회
export const getArticleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const article = await articleService.getArticleById(id, userId);
  res.json({ success: true, data: article });
};

// 게시글 생성
export const createArticle = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const article = await articleService.createArticle(userId, data);
  res.status(201).json({ success: true, data: article });
};

// 게시글 수정
export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;
  const article = await articleService.updateArticle(id, userId, data);
  res.json({ success: true, data: article });
};

// 게시글 삭제
export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  await articleService.deleteArticle(id, userId);
  res.status(200).json({ success: true, message: '게시글이 삭제되었습니다.' });
};
