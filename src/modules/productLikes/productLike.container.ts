import prisma from '../../lib/prisma.js';

// Repositories
import { ProductLikeRepository } from './productLike.repository.js';

// Services
import { ProductLikeService } from './productLike.service.js';
import { notificationService } from '../notifications/notification.container.js';

// Controllers
import { ProductLikeController } from './productLike.controller.js';

// 의존성 주입
const productLikeRepository = new ProductLikeRepository(prisma);
const productLikeService = new ProductLikeService(productLikeRepository, notificationService);

export const productLikeController = new ProductLikeController(productLikeService);
