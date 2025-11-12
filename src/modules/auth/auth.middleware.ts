import { validateBody } from '../../middlewares/validate.middleware.js';
import { signup, login, refresh } from './auth.dto.js';

// ----------------
// |  VALIDATORS  |
// ----------------

// 회원가입
export const validateSignupBody = validateBody(signup);

// 로그인
export const validateloginBody = validateBody(login);

// 토큰 재발급
export const validateRefreshBody = validateBody(refresh);
