import { z } from 'zod';

// 커서 방식
export const cursorSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(10),
    cursor: z.uuid(),
    search: z.string(),
  })
  .partial()
  .strict();

export type CursorQuery = z.infer<typeof cursorSchema>;

// 컷서 방식 (알림)
export const cursorNotificationSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(10),
    cursor: z.uuid(),
    isRead: z.boolean(),
  })
  .partial()
  .strict();

export type CursorNotificationQuery = z.infer<typeof cursorNotificationSchema>;

// offset 방식
export const offsetSchema = z
  .object({
    limit: z.coerce.number().min(1).max(50).default(10),
    offset: z.coerce.number().min(0).default(0),
    search: z.string(),
    order: z.enum(['old', 'recent']).default('recent'),
  })
  .partial()
  .strict();

export type OffsetQuery = z.infer<typeof offsetSchema>;
