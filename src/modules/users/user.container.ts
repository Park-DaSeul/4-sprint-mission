import prisma from '../../lib/prisma.js';

// Repositories
import { UserRepository } from './user.repository.js';

// Services
import { UserService } from './user.service.js';

// Controllers
import { UserController } from './user.controller.js';

// 의존성 주입
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

export const userController = new UserController(userService);
