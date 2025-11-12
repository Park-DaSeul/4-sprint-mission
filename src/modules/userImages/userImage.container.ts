import prisma from '../../lib/prisma.js';

// Repositories
import { UserImageRepository } from './userImage.repository.js';

// Services
import { UserImageService } from './userImage.service.js';

// Controllers
import { UserImageController } from './userImage.controller.js';

// 의존성 주입
const userImageRepository = new UserImageRepository(prisma);
const userImageService = new UserImageService(userImageRepository);

export const userImageController = new UserImageController(userImageService);
