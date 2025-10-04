import prisma from '../../lib/prisma.js';

// Repositories
import { ArticleCommentRepository } from './articleComment.repository.js';

// Services
import { ArticleCommentService } from './articleComment.service.js';
import { notificationService } from '../notifications/notification.container.js';

// Controllers
import { ArticleCommentController } from './articleComment.controller.js';

// 의존성 주입
const articleCommentRepository = new ArticleCommentRepository(prisma);
const articleCommentService = new ArticleCommentService(articleCommentRepository, notificationService);

export const articleCommentController = new ArticleCommentController(articleCommentService);
