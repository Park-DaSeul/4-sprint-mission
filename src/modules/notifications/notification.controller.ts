import { NotificationService } from './notification.service.js';
import type { Response } from 'express';
import type {
  GetNotificationsRequest,
  GetUnreadCountRequest,
  UpdateNotificationRequest,
  UpdateNotificationAllRequest,
} from './notification.dto.js';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // 사용자의 모든 알림 조회
  public getNotifications = async (req: GetNotificationsRequest, res: Response) => {
    const query = req.parsedQuery;

    const userId = req.user.id;

    const notifications = await this.notificationService.getNotifications(query, userId);
    res.status(200).json({ success: true, data: notifications });
  };

  // 사용자 알림 개수 조회 (안읽음)
  public getUnreadCount = async (req: GetUnreadCountRequest, res: Response) => {
    const userId = req.user.id;

    const notification = await this.notificationService.getUnreadCount(userId);
    res.status(200).json({ success: true, data: notification });
  };

  // 사용자 모든 알림 수정 (읽음)
  public updateNotificationAll = async (req: UpdateNotificationAllRequest, res: Response) => {
    const userId = req.user.id;

    const notification = await this.notificationService.updateNotificationAll(userId);
    res.status(200).json({ success: true, data: notification });
  };

  // 사용자 알림 수정 (읽음)
  public updateNotification = async (req: UpdateNotificationRequest, res: Response) => {
    const { id } = req.parsedParams;

    const notification = await this.notificationService.updateNotification(id);
    res.status(200).json({ success: true, data: notification });
  };
}
