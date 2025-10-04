import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import type { IdParams, CursorNotificationQuery } from '../../common/index.js';
import type { NotificationType } from '@prisma/client';

// -----------------
// |  TYPE & DATA  |
// -----------------

// 사용자의 모든 알림 조회
export interface GetNotificationsRequest extends AuthenticatedRequest {
  parsedQuery: CursorNotificationQuery;
}

// 사용자 알림 개수 조회 (안읽음)
export interface GetUnreadCountRequest extends AuthenticatedRequest {}

// 사용자 알림 생성
export interface CreateNotificationBody {
  recipientId: string;
  senderId: string;
  entityId: string;
  type: NotificationType;
  message: string;
}

// 사용자 알림 수정 (읽음)
export interface UpdateNotificationRequest extends AuthenticatedRequest {
  parsedParams: IdParams;
}

// 사용자 모든 알림 수정 (읽음)
export interface UpdateNotificationAllRequest extends AuthenticatedRequest {}
