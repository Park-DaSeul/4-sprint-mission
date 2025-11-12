import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import type { SignupRequest, LoginRequest, RefreshRequest } from './auth.dto.js';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../lib/constants.js';
import { tokensAndSetCookies } from '../../common/index.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  // 회원가입
  public signup = async (req: SignupRequest, res: Response) => {
    const data = req.parsedBody;

    const user = await this.authService.signup(data);
    return res.status(201).json({ success: true, data: user });
  };

  // 로그인
  public login = async (req: LoginRequest, res: Response) => {
    const userId = req.user.id;

    const { accessToken, refreshToken } = this.authService.login(userId);
    tokensAndSetCookies(res, accessToken, refreshToken);
    return res.status(200).json({ success: true });
  };

  // 토큰 재발급
  public refresh = async (req: RefreshRequest, res: Response) => {
    const userId = req.user.id;

    const { accessToken, refreshToken } = this.authService.refresh(userId);
    tokensAndSetCookies(res, accessToken, refreshToken);
    return res.status(200).json({ success: true });
  };

  // 로그아웃
  public logout = async (_req: Request, res: Response) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
  };
}
