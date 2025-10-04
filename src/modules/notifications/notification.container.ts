import prisma from '../../lib/prisma.js';

// Repositories
import { NotificationRepository } from './notification.repository.js';

// Services
import { NotificationService } from './notification.service.js';

// Controllers
import { NotificationController } from './notification.controller.js';

// 의존성 주입
const notificationRepository = new NotificationRepository(prisma);

export const notificationService = new NotificationService(notificationRepository);
export const notificationController = new NotificationController(notificationService);
