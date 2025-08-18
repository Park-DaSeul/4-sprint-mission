import { transform, z } from 'zod';

// Product 생성 시 유효성 검사를 위한 스키마
export const createProductSchema = z.object({
  name: z.string().min(1, { message: '상품 이름을 작성하세요.' }),
  description: z.string().optional(),
  price: z
    .number()
    .int()
    .positive({ message: '가격은 0보다 큰 정수여야 합니다.' }),
  tags: z
    .array(z.string())
    .optional()
    .transform((val) => (val === undefined ? [] : val)),
});

// Product 업데이트 시 유효성 검사를 위한 스키마
// partial()을 사용하여 모든 필드를 선택 사항으로 만듭니다.
// 이렇게 하면 부분 업데이트가 가능해집니다.
export const updateProductSchema = createProductSchema.partial();

// Product ID 유효성 검사를 위한 스키마 (UUID 형식 확인)
export const productIdSchema = z.object({
  id: z.uuid({ message: '유효하지 않은 상품 ID 형식입니다.' }),
});

// productId를 사용하기 위한 스키마
export const productParamSchema = z.object({
  productId: z.uuid({ message: '유효하지 않은 상품 ID 형식입니다.' }),
});
