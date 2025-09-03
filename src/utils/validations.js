// id
export const idSchema = z.uuid('UUID 형식이어야 합니다.');
export const userIdSchema = z.uuid('유효한 사용자 ID를 입력하세요.');
export const articleIdSchema = z.uuid('유효한 게시물 ID를 입력하세요.');
export const productIdSchema = z.uuid('유효한 게시물 ID를 입력하세요.');

// // auth + user
// export const nameSchema = z
//   .string()
//   .min(2, '이름은 최소 2글자 이상이어야 합니다.')
//   .max(20, '이름은 최대 20글자까지 가능합니다.');
// export const nicknameSchema = z
//   .string()
//   .min(1, '닉네임은 최소 1글자 이상이어야 합니다.')
//   .max(20, '닉네임은 최대 20글자까지 가능합니다.');
// export const passwordSchema = z
//   .string()
//   .min(6, '비밀번호는 최소 6자리 이상이어야 합니다.')
//   .max(20, '비밀번호는 최대 20자리까지 가능합니다.');
// export const emailSchema = z.email('올바른 이메일 형식이 아닙니다.');

// comment
export const contentShema = z
  .string()
  .min(1, '댓글은 최소 1글자 이상이어야 합니다.')
  .max(600, '댓은 최대 500글자까지 가능합니다.');

// article
export const titleSchema = z
  .string()
  .min(1, '제목은 최소 1글자 이상이어야 합니다.')
  .max(100, '제목은 최대 100글자까지 가능합니다.');
export const contentSchema = z
  .string()
  .min(1, '내용은 최소 1글자 이상이어야 합니다.')
  .max(1000, '내용은 최대 1000글자까지 가능합니다.');
export const imageUrlSchema = z.url('이미지 URL 형식이 올바르지 않습니다.').optional();

// product
export const nameSchema = z
  .string()
  .min(1, '상품 이름은 최소 1글자 이상이어야 합니다.')
  .max(100, '상품 이름은 최대 100글자까지 가능합니다.');
export const descriptionSchema = z
  .string()
  .min(1, '상품 설명은 최소 1글자 이상이어야 합니다.')
  .max(1000, '상품 설명은 최대 1000글자까지 가능합니다.');
export const priceSchema = z.number().nonnegative();

export const tagsSchema = z
  .array(z.string())
  .min(1, '태그를 최소 1개 이상 입력해주세요.')
  // 태그 배열의 각 항목에서 공백을 제거하고 빈 문자열을 필터링합니다.
  .transform((tags) => tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
  // refine으로 추가 유효성 검사
  .refine((tags) => tags.length > 0, '유효한 태그가 제공되어야 합니다.');
