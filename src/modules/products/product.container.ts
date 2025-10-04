import prisma from '../../lib/prisma.js';

// Repositories
import { ProductRepository } from './product.repository.js';

// Services
import { ProductService } from './product.service.js';
import { notificationService } from '../notifications/notification.container.js';

// Controllers
import { ProductController } from './product.controller.js';

// 의존성 주입
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository, notificationService);

export const productController = new ProductController(productService);
