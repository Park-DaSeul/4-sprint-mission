import prisma from '../../lib/prisma.js';

// Repositories
import { ProductCommentRepository } from './productComment.repository.js';

// Services
import { ProductCommentService } from './productComment.service.js';
import { notificationService } from '../notifications/notification.container.js';

// Controllers
import { ProductCommentController } from './productComment.controller.js';

// 의존성 주입
const productCommentRepository = new ProductCommentRepository(prisma);
const productCommentService = new ProductCommentService(productCommentRepository, notificationService);

export const productCommentController = new ProductCommentController(productCommentService);
