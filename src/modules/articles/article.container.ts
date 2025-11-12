import prisma from '../../lib/prisma.js';

// Repositories
import { ArticleRepository } from './article.repository.js';

// Services
import { ArticleService } from './article.service.js';

// Controllers
import { ArticleController } from './article.controller.js';

// 의존성 주입
const articleRepository = new ArticleRepository(prisma);
const articleService = new ArticleService(articleRepository);

export const articleController = new ArticleController(articleService);
