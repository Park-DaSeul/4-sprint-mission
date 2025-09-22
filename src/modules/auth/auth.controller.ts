import * as authService from './auth.service.js';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../libs/constants.js';
import { tokensAndSetCookies } from '../../utils/auth.js';

// 회원가입
export const signup = async (req: Request, res: Response) => {
  const data = req.body;
  const user = await authService.signup(data);
  return res.status(201).json({ success: true, data: user });
};

// 로그인
export const login = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const { accessToken, refreshToken } = authService.login(userId);
  tokensAndSetCookies(res, accessToken, refreshToken);
  return res.status(200).json({ success: true });
};

// 토큰 재발급
export const refresh = (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const { accessToken, refreshToken } = authService.refresh(userId);
  tokensAndSetCookies(res, accessToken, refreshToken);
  return res.status(200).json({ success: true });
};

// 로그아웃
export const logout = (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

  return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
};
