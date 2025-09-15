import * as userService from './users.service.js';
import type { Request, Response } from 'express';

// 사용자 조회
export const getUser = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { id } = req.user;

  const user = await userService.getUser(id);
  return res.json({ success: true, data: user });
};

// 사용자 수정
export const updateUser = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { id } = req.user;

  const data = req.body;
  const user = await userService.updateUser(id, data);
  return res.json({ success: true, data: user });
};

// 사용자 삭제
export const deleteUser = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { id } = req.user;

  const data = req.body;
  await userService.deleteUser(id, data);
  return res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
};

// 사용자가 등록한 상품 목록 조회
export const getUserProducts = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { id } = req.user;

  const user = await userService.getUserProducts(id);
  return res.json({ success: true, data: user });
};

// 사용자가 좋아요 누른 상품 목록 조회
export const getUserLikedProducts = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { id } = req.user;

  const user = await userService.getUserLikedProducts(id);
  return res.json({ success: true, data: user });
};
