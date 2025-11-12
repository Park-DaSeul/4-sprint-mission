import jwt from 'jsonwebtoken';
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from './constants.js';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (userId: string): Tokens => {
  const accessToken = jwt.sign({ sub: userId }, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  const refreshToken = jwt.sign({ sub: userId }, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });
  return { accessToken, refreshToken };
};
