import * as authService from '../services/auth.service.js';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../libs/constants.js';
import { tokensAndSetCookies } from '../utils/auth.js';

// 회원가입
export const signup = async (req, res) => {
  const data = req.body;
  const user = await authService.signup(data);
  res.status(201).json({ success: true, data: user });
};

// 로그인
export const login = async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = authService.login(user.id);
  tokensAndSetCookies(res, accessToken, refreshToken);
  res.status(200).json({ accessToken, refreshToken });
};

// 토큰 재발급
export const refresh = (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = authService.refresh(user.id);
  tokensAndSetCookies(res, accessToken, refreshToken);
  res.status(200).json({ accessToken, refreshToken });
};

// 로그아웃
export const logout = (req, res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

  res.status(200).json();
};
