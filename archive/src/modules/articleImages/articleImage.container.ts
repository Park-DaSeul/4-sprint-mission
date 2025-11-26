import prisma from '../../lib/prisma.js';

// Repositories
import { ArticleImageRepository } from './articleImage.repository.js';

// Services
import { ArticleImageService } from './articleImage.service.js';

// Controllers
import { ArticleImageController } from './articleImage.controller.js';

// 의존성 주입
const articleImageRepository = new ArticleImageRepository(prisma);
const articleImageService = new ArticleImageService(articleImageRepository);

export const articleImageController = new ArticleImageController(articleImageService);
