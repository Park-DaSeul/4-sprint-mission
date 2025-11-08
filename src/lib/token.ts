import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (userId: string): Tokens => {
  const accessToken = jwt.sign({ sub: userId }, config.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  const refreshToken = jwt.sign({ sub: userId }, config.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });
  return { accessToken, refreshToken };
};
