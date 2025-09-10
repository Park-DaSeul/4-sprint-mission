import * as articleService from '../services/article.service.js';
import type { Request, Response } from 'express';

// 모든 게시글 조회
export const getArticles = async (req: Request, res: Response) => {
  const query = req.query;
  const userId = req.user ? req.user.id : null;

  const articles = await articleService.getArticles(query, userId);
  res.json({ success: true, data: articles });
};

// 특정 게시글 조회
export const getArticleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('게시글 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const article = await articleService.getArticleById(id, userId);
  res.json({ success: true, data: article });
};

// 게시글 생성
export const createArticle = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const data = req.body;
  const article = await articleService.createArticle(userId, data);
  res.status(201).json({ success: true, data: article });
};

// 게시글 수정
export const updateArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('게시글 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const data = req.body;
  const article = await articleService.updateArticle(id, userId, data);
  res.json({ success: true, data: article });
};

// 게시글 삭제
export const deleteArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error('게시글 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  await articleService.deleteArticle(id, userId);
  res.status(200).json({ success: true, message: '게시글이 삭제되었습니다.' });
};
