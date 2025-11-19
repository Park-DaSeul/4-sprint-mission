import { NotificationService } from '../../../src/modules/notifications/notification.service.js';
import { NotificationRepository } from '../../../src/modules/notifications/notification.repository.js';
import { getSocketIo } from '../../../src/lib/socket.js';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import type { CreateNotificationBody } from '../../../src/modules/notifications/notification.dto.js';

// 가짜(mock) 객체 생성
const mockNotificationRepository = {
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  createNotifications: vi.fn(),
  createNotification: vi.fn(),
  updateNotificationAll: vi.fn(),
  updateNotification: vi.fn(),
};

// getSocketIo 함수를 모킹
vi.mock('../../../src/lib/socket.js', () => ({
  getSocketIo: vi.fn(),
}));

const mockIo = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
};

describe('NotificationService 유닛 테스트', () => {
  let notificationService: NotificationService;

  const userId = 'user-id-1';
  const senderId = 'sender-id-1';
  const notificationId = 'notification-id-1';

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    notificationService = new NotificationService(mockNotificationRepository as unknown as NotificationRepository);
    (getSocketIo as Mock).mockReturnValue(mockIo);
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 사용자의 모든 알림 조회
  describe('getNotifications', () => {
    it('사용자의 알림 목록을 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockNotifications = [
        { id: 'notification-1', message: '알림 1' },
        { id: 'notification-2', message: '알림 2' },
      ];
      mockNotificationRepository.getNotifications.mockResolvedValue(mockNotifications);

      // --- 실행 (Act) ---
      const result = await notificationService.getNotifications({ limit: 10 }, userId);

      const getQuery = {
        where: {
          recipientId: userId,
        },
        take: 10,
        skip: 0,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith(getQuery);
      expect(result.notifications).toEqual(mockNotifications);
    });

    it('커서 기반 페이지네이션이 올바르게 작동해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const cursor = 'notification-2';
      const mockNotifications = [{ id: 'notification-3', message: '알림 3' }];
      mockNotificationRepository.getNotifications.mockResolvedValue(mockNotifications);

      // --- 실행 (Act) ---
      const result = await notificationService.getNotifications({ limit: 10, cursor }, userId);

      const getQuery = {
        where: { recipientId: userId },
        take: 10,
        skip: 1,
        cursor: { id: cursor },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      };

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith(getQuery);
      expect(result.nextCursor).toBe('notification-3');
    });

    it('알림이 더 이상 없을 때 nextCursor는 null을 반환해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockNotificationRepository.getNotifications.mockResolvedValue([]);

      // --- 실행 (Act) ---
      const result = await notificationService.getNotifications({ limit: 10 }, userId);

      // --- 검증 (Assert) ---
      expect(result.notifications).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it('isRead 필터가 올바르게 작동해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      mockNotificationRepository.getNotifications.mockResolvedValue([]);

      // --- 실행 (Act) ---
      await notificationService.getNotifications({ isRead: true }, userId);

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { recipientId: userId, isRead: true },
        }),
      );

      // --- 실행 (Act) ---
      await notificationService.getNotifications({ isRead: false }, userId);

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { recipientId: userId, isRead: false },
        }),
      );
    });
  });

  // 사용자 알림 개수 조회 (안읽음)
  describe('getUnreadCount', () => {
    it('읽지 않은 알림의 개수를 정상적으로 조회해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const unreadCount = 5;
      mockNotificationRepository.getUnreadCount.mockResolvedValue(unreadCount);

      // --- 실행 (Act) ---
      const result = await notificationService.getUnreadCount(userId);

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.getUnreadCount).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.getUnreadCount).toHaveBeenCalledWith(userId);
      expect(result).toBe(unreadCount);
    });
  });

  // 사용자 알림 대량 생성
  describe('createNotifications', () => {
    it('여러 개의 알림을 생성하고 실시간으로 전송해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data: CreateNotificationBody[] = [
        { recipientId: 'user-1', senderId: 'sender-1', entityId: 'entity-1', type: 'ARTICLE_LIKE', message: '알림 1' },
        { recipientId: 'user-2', senderId: 'sender-2', entityId: 'entity-1', type: 'ARTICLE_LIKE', message: '알림 2' },
      ];
      const mockCreatedNotifications = { count: 2 };
      mockNotificationRepository.createNotifications.mockResolvedValue(mockCreatedNotifications);

      // --- 실행 (Act) ---
      const result = await notificationService.createNotifications(data);

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.createNotifications).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.createNotifications).toHaveBeenCalledWith(data);
      expect(getSocketIo).toHaveBeenCalledTimes(1);
      expect(mockIo.to).toHaveBeenCalledTimes(2);
      expect(mockIo.to).toHaveBeenCalledWith('user-1');
      expect(mockIo.to).toHaveBeenCalledWith('user-2');
      expect(mockIo.emit).toHaveBeenCalledTimes(2);
      expect(mockIo.emit).toHaveBeenCalledWith('notification', data[0]);
      expect(mockIo.emit).toHaveBeenCalledWith('notification', data[1]);
      expect(result).toEqual(mockCreatedNotifications);
    });
  });

  // 사용자 알림 생성
  describe('createNotification', () => {
    it('하나의 알림을 생성하고 실시간으로 전송해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data: CreateNotificationBody = {
        recipientId: userId,
        senderId: senderId,
        entityId: 'entity-id-1',
        type: 'ARTICLE_LIKE',
        message: '새로운 좋아요!',
      };
      const mockCreatedNotification = {
        id: notificationId,
        ...data,
      };
      mockNotificationRepository.createNotification.mockResolvedValue(mockCreatedNotification);

      // --- 실행 (Act) ---
      const result = await notificationService.createNotification(data);

      const createData = {
        recipient: {
          connect: { id: data.recipientId },
        },
        sender: {
          connect: { id: data.senderId },
        },
        entityId: data.entityId,
        type: data.type,
        message: data.message,
      };

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.createNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.createNotification).toHaveBeenCalledWith(createData);
      expect(getSocketIo).toHaveBeenCalledTimes(1);
      expect(mockIo.to).toHaveBeenCalledTimes(1);
      expect(mockIo.to).toHaveBeenCalledWith(data.recipientId);
      expect(mockIo.emit).toHaveBeenCalledTimes(1);
      expect(mockIo.emit).toHaveBeenCalledWith('notification', mockCreatedNotification);
      expect(result).toEqual(mockCreatedNotification);
    });
  });

  // 사용자 모든 알림 수정 (읽음)
  describe('updateNotificationAll', () => {
    it('사용자의 모든 읽지 않은 알림을 읽음으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockUpdatedNotification = { count: 3 };
      mockNotificationRepository.updateNotificationAll.mockResolvedValue(mockUpdatedNotification);

      // --- 실행 (Act) ---
      const result = await notificationService.updateNotificationAll(userId);

      const updateData = {
        isRead: true,
      };

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.updateNotificationAll).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.updateNotificationAll).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(mockUpdatedNotification);
    });
  });

  // 사용자 알림 수정 (읽음)
  describe('updateNotification', () => {
    it('특정 알림을 읽음으로 수정해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const mockUpdatedNotification = {
        id: notificationId,
        isRead: true,
      };
      mockNotificationRepository.updateNotification.mockResolvedValue(mockUpdatedNotification);

      // --- 실행 (Act) ---
      const result = await notificationService.updateNotification(notificationId);

      const updateData = {
        isRead: true,
      };

      // --- 검증 (Assert) ---
      expect(mockNotificationRepository.updateNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.updateNotification).toHaveBeenCalledWith(notificationId, updateData);
      expect(result).toEqual(mockUpdatedNotification);
    });
  });
});
