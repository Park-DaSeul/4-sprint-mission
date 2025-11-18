import { ImageService } from '../../../src/modules/images/image.service.js';
import * as s3 from '../../../src/lib/s3-service.js';
import { vi } from 'vitest';

describe('ImageService 유닛 테스트', () => {
  let imageService: ImageService;

  // 테스트 케이스가 실행되기 전에 매번 실행
  beforeEach(() => {
    // 의존성 주입
    imageService = new ImageService();
  });

  // 각 테스트가 끝난 후 모든 모의(mock)를 원래대로 복원
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // 게시글 사진 생성 (업로드)
  describe('createImage', () => {
    it('Presigned URL을 정상적으로 생성해야 한다.', async () => {
      // --- 준비 (Arrange) ---
      const data = {
        filename: 'test.png',
        contentType: 'image/png',
      };

      const fakeUrl = {
        fields: { 'Content-Type': data.contentType },
        url: `https://fake-url.com/${data.filename}}`,
        key: data.filename,
      };
      const urlSpy = vi.spyOn(s3, 'getUploadPresignedUrl').mockResolvedValue(fakeUrl);

      // --- 실행 (Act) ---
      const result = await imageService.createImage(data);

      // --- 검증 (Assert) ---
      expect(urlSpy).toHaveBeenCalledTimes(1);
      expect(urlSpy).toHaveBeenCalledWith(data.filename, data.contentType);
      expect(result).toEqual(fakeUrl);
    });
  });
});
