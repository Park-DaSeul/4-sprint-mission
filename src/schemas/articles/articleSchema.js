import { z } from 'zod';

// Article 생성 시 유효성 검사를 위한 스키마
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, { message: '게시판 제목을 작성하세요.' })
    .max(200, { message: '게시판 제목은 200자를 초과할 수 없습니다.' }),
  content: z.string().optional(),
});

// Article 업데이트 시 유효성 검사를 위한 스키마
// partial()을 사용하여 모든 필드를 선택 사항으로 만듭니다.
// 이렇게 하면 부분 업데이트가 가능해집니다.
export const updateArticleSchema = createArticleSchema.partial();

// Article  ID 유효성 검사를 위한 스키마 (UUID 형식 확인)
export const articleIdSchema = z.object({
  id: z.uuid({ message: '유효하지 않은 게시판 ID 형식입니다.' }),
});

// articleId를 사용하기 위한 스키마
export const articleParamSchema = z.object({
  articleId: z.uuid({ message: '유효하지 않은 게시판 ID 형식입니다.' }),
});
