import prisma from '../../lib/prisma.js';

// Repositories
import { ProductImageRepository } from './productImage.repository.js';

// Services
import { ProductImageService } from './productImage.service.js';

// Controllers
import { ProductImageController } from './productImage.controller.js';

// 의존성 주입
const productImageRepository = new ProductImageRepository(prisma);
const productImageService = new ProductImageService(productImageRepository);

export const productImageController = new ProductImageController(productImageService);
