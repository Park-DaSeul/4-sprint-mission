import { Router } from 'express';
import { notificationController } from './notification.container.js';
import { validateId, validateGetQuery, checkNotificationOwner } from './notification.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const notificationRouter = Router();

// --- 여기부터 로그인 필요 ---
notificationRouter.use(authenticate);

// 사용자 모든 알림 조회
notificationRouter.get('/', validateGetQuery, asyncHandler(notificationController.getNotifications));

// 사용자 알림 개수 조회 (안읽음)
notificationRouter.get('/unreadCount', asyncHandler(notificationController.getUnreadCount));

// 사용자 모든 알림 수정 (읽음)
notificationRouter.put('/all', asyncHandler(notificationController.updateNotificationAll));

// 사용자 알림 수정 (읽음)
notificationRouter.put(
  '/:id',
  validateId,
  checkNotificationOwner,
  asyncHandler(notificationController.updateNotification),
);

export { notificationRouter };
