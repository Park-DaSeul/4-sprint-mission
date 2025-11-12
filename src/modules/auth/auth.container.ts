import prisma from '../../lib/prisma.js';

// Repositories
import { AuthRepository } from './auth.repository.js';

// Services
import { AuthService } from './auth.service.js';

// Controllers
import { AuthController } from './auth.controller.js';

// 의존성 주입
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);

export const authController = new AuthController(authService);
