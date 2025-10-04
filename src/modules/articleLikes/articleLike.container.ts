import prisma from '../../lib/prisma.js';

// Repositories
import { ArticleLikeRepository } from './articleLike.repository.js';

// Services
import { ArticleLikeService } from './articleLike.service.js';
import { notificationService } from '../notifications/notification.container.js';

// Controllers
import { ArticleLikeController } from './articleLike.controller.js';

// 의존성 주입
const articleLikeRepository = new ArticleLikeRepository(prisma);
const articleLikeService = new ArticleLikeService(articleLikeRepository, notificationService);

export const articleLikeController = new ArticleLikeController(articleLikeService);
