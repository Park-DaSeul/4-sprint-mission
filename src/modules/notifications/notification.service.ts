import { NotificationRepository } from './notification.repository.js';
import type { Prisma } from '@prisma/client';
import type { CreateNotificationBody } from './notification.dto.js';
import type { CursorNotificationQuery } from '../../common/index.js';
import { getSocketIo } from '../../lib/socket.js';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  // 사용자의 모든 알림 조회
  public getNotifications = async (query: CursorNotificationQuery, userId: string) => {
    const { limit: take = 10, cursor, isRead } = query;

    // where 조건 추가
    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
      ...(isRead !== undefined && { isRead }),
    };

    // query 구성
    const getQuery: Prisma.NotificationFindManyArgs = {
      where,
      take,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    };

    const notifications = await this.notificationRepository.getNotifications(getQuery);

    const lastNotificationsInResults = notifications[notifications.length - 1];
    const nextCursor = lastNotificationsInResults ? lastNotificationsInResults.id : null;

    const notificationsData = {
      notifications,
      nextCursor,
    };

    return notificationsData;
  };

  // 사용자 알림 개수 조회 (안읽음)
  public getUnreadCount = async (userId: string) => {
    const notification = await this.notificationRepository.getUnreadCount(userId);

    return notification;
  };

  // 사용자 알림 대량 생성
  public createNotifications = async (data: CreateNotificationBody[]) => {
    const createData: Prisma.NotificationCreateManyInput[] = data;

    const notifications = await this.notificationRepository.createNotifications(createData);

    // Socket.io를 통해 실시간으로 알림 전송
    const io = getSocketIo();

    // Promise.all을 사용하여 실시간으로 알림 전송
    const socketPromises = data.map((notification) => {
      // recipientId를 기반으로 특정 사용자에게만 알림을 보냅니다.
      io.to(notification.recipientId).emit('notification', notification);
    });

    // 모든 소켓 전송이 완료될 때까지 기다립니다.
    await Promise.all(socketPromises);

    return notifications;
  };

  // 사용자 알림 생성
  public createNotification = async (data: CreateNotificationBody) => {
    const { recipientId, senderId, entityId, type, message } = data;

    const createData: Prisma.NotificationCreateInput = {
      recipient: {
        connect: { id: recipientId },
      },
      sender: {
        connect: { id: senderId },
      },
      entityId,
      type,
      message,
    };

    const notification = await this.notificationRepository.createNotification(createData);

    // Socket.io를 통해 실시간으로 알림 전송
    const io = getSocketIo();
    // recipientId를 기반으로 특정 사용자에게만 알림을 보냅니다.
    io.to(data.recipientId).emit('notification', notification);

    return notification;
  };

  // 사용자 모든 알림 수정 (읽음)
  public updateNotificationAll = async (userId: string) => {
    const updateData: Prisma.NotificationUpdateInput = {
      isRead: true,
    };

    const notification = this.notificationRepository.updateNotificationAll(userId, updateData);

    return notification;
  };

  // 사용자 알림 수정 (읽음)
  public updateNotification = async (id: string) => {
    const updateData: Prisma.NotificationUpdateInput = {
      isRead: true,
    };

    const notification = await this.notificationRepository.updateNotification(id, updateData);

    return notification;
  };
}
