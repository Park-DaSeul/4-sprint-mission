import type { Prisma, PrismaClient } from '@prisma/client';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  // 사용자의 모든 알림 조회
  public getNotifications = async (getQuery: Prisma.NotificationFindManyArgs) => {
    const notifications = await this.prisma.notification.findMany({
      ...getQuery,
      select: {
        id: true,
        entityId: true,
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
        sender: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return notifications;
  };

  // 사용자 알림 개수 조회 (안읽음)
  public getUnreadCount = async (userId: string) => {
    const notification = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return notification;
  };

  // 사용자 알림 대량 생성
  public createNotifications = async (createData: Prisma.NotificationCreateManyInput[]) => {
    const notifications = await this.prisma.notification.createMany({
      data: createData,
    });

    return notifications;
  };

  // 사용자 알림 생성
  public createNotification = async (createData: Prisma.NotificationCreateInput) => {
    const notification = await this.prisma.notification.create({
      data: createData,
    });

    return notification;
  };

  // 사용자 모든 알림 수정 (읽음)
  public updateNotificationAll = async (userId: string, updateData: Prisma.NotificationUpdateInput) => {
    const notification = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: updateData,
    });

    return notification;
  };

  // 사용자 알림 수정 (읽음)
  public updateNotification = async (id: string, updateData: Prisma.NotificationUpdateInput) => {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return notification;
  };
}
