import cron from 'node-cron';
import { v2 as cloudinary } from 'cloudinary';
import prisma from './prisma.js';

// ------------------------------------------------------------------
// 공통 로직 함수: Cloudinary에서 파일 삭제
// ------------------------------------------------------------------
const cloudinaryDeleted = async (publicIdsToDelete: string[], resourceType: string, type: string) => {
  try {
    const cloudinaryResult = await cloudinary.api.delete_resources(publicIdsToDelete, {
      type: type,
      resource_type: resourceType,
    });

    console.log('[Cloudinary] 삭제 결과:', cloudinaryResult);

    return true;
  } catch (err) {
    // Cloudinary 삭제 실패 시 DB 삭제를 막고 즉시 종료 (데이터 무결성 유지)
    console.error('[Cloudinary] 파일 삭제 중 오류 발생. DB 삭제를 건너뛰고 다음 스케줄에 재시도합니다:', err);

    return false;
  }
};

// ------------------------------------------------------------------
// 미연결된 사용자 이미지 삭제
// ------------------------------------------------------------------
const findAndDeleteOrphanUserImages = async () => {
  const logName = '이미지';
  const resourceType = 'image';
  const type = 'upload';

  console.log(`[CRON] 미연결 ${logName} 삭제 작업을 시작합니다.`);

  // 24시간 이전의 타임스탬프 계산
  const oneDaysAgo = new Date();
  oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

  // 조건: contractId가 null이고, 생성된 지 24시간(1일)이 지난 문서 조회
  try {
    const orphanData = await prisma.userImage.findMany({
      where: {
        userId: null,
        createdAt: {
          lt: oneDaysAgo,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    if (orphanData.length === 0) {
      return console.log(`[CRON] 삭제할 미연결 ${logName}가 없습니다.`);
    }

    const publicIdsToDelete = orphanData.map((resource) => resource.publicId);
    const resourceIdToDelete = orphanData.map((resource) => resource.id);

    console.log(
      `[CRON] 삭제 대상 ${logName} ${resourceIdToDelete.length}개 발견. Public IDs: ${publicIdsToDelete.join(', ')}`,
    );

    // Cloudinary에서 파일 삭제
    const isCloudinaryDeleted = await cloudinaryDeleted(publicIdsToDelete, resourceType, type);

    // Cloudinary 삭제 실패 시 DB 삭제 건너뛰기
    if (!isCloudinaryDeleted) {
      return;
    }

    // DB에서 일괄 삭제 (Cloudinary 삭제 성공시에만 실행)
    const deleteData = await prisma.userImage.deleteMany({
      where: {
        id: {
          in: resourceIdToDelete,
        },
      },
    });

    console.log(`[DB] 총 ${deleteData.count}개의 미연결 ${logName}를 삭제했습니다.`);

    return orphanData;
  } catch (err) {
    return console.error(`[CRON ERROR] 미연결 ${logName} 삭제 중 오류 발생:`, err);
  }
};

// ------------------------------------------------------------------
// 미연결된 상품 이미지 삭제
// ------------------------------------------------------------------
const findAndDeleteOrphanProductImages = async () => {
  const logName = '이미지';
  const resourceType = 'image';
  const type = 'upload';

  console.log(`[CRON] 미연결 ${logName} 삭제 작업을 시작합니다.`);

  // 24시간 이전의 타임스탬프 계산
  const oneDaysAgo = new Date();
  oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

  // 조건: contractId가 null이고, 생성된 지 24시간(1일)이 지난 문서 조회
  try {
    const orphanData = await prisma.productImage.findMany({
      where: {
        productId: null,
        createdAt: {
          lt: oneDaysAgo,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    if (orphanData.length === 0) {
      return console.log(`[CRON] 삭제할 미연결 ${logName}가 없습니다.`);
    }

    const publicIdsToDelete = orphanData.map((resource) => resource.publicId);
    const resourceIdToDelete = orphanData.map((resource) => resource.id);

    console.log(
      `[CRON] 삭제 대상 ${logName} ${resourceIdToDelete.length}개 발견. Public IDs: ${publicIdsToDelete.join(', ')}`,
    );

    // Cloudinary에서 파일 삭제
    const isCloudinaryDeleted = await cloudinaryDeleted(publicIdsToDelete, resourceType, type);

    // Cloudinary 삭제 실패 시 DB 삭제 건너뛰기
    if (!isCloudinaryDeleted) {
      return;
    }

    // DB에서 일괄 삭제 (Cloudinary 삭제 성공시에만 실행)
    const deleteData = await prisma.productImage.deleteMany({
      where: {
        id: {
          in: resourceIdToDelete,
        },
      },
    });

    console.log(`[DB] 총 ${deleteData.count}개의 미연결 ${logName}를 삭제했습니다.`);

    return orphanData;
  } catch (err) {
    return console.error(`[CRON ERROR] 미연결 ${logName} 삭제 중 오류 발생:`, err);
  }
};

// ------------------------------------------------------------------
// 미연결된 게시판 이미지 삭제
// ------------------------------------------------------------------
const findAndDeleteOrphanArticleImages = async () => {
  const logName = '이미지';
  const resourceType = 'image';
  const type = 'upload';

  console.log(`[CRON] 미연결 ${logName} 삭제 작업을 시작합니다.`);

  // 24시간 이전의 타임스탬프 계산
  const oneDaysAgo = new Date();
  oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

  // 조건: contractId가 null이고, 생성된 지 24시간(1일)이 지난 문서 조회
  try {
    const orphanData = await prisma.articleImage.findMany({
      where: {
        articleId: null,
        createdAt: {
          lt: oneDaysAgo,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    if (orphanData.length === 0) {
      return console.log(`[CRON] 삭제할 미연결 ${logName}가 없습니다.`);
    }

    const publicIdsToDelete = orphanData.map((resource) => resource.publicId);
    const resourceIdToDelete = orphanData.map((resource) => resource.id);

    console.log(
      `[CRON] 삭제 대상 ${logName} ${resourceIdToDelete.length}개 발견. Public IDs: ${publicIdsToDelete.join(', ')}`,
    );

    // Cloudinary에서 파일 삭제
    const isCloudinaryDeleted = await cloudinaryDeleted(publicIdsToDelete, resourceType, type);

    // Cloudinary 삭제 실패 시 DB 삭제 건너뛰기
    if (!isCloudinaryDeleted) {
      return;
    }

    // DB에서 일괄 삭제 (Cloudinary 삭제 성공시에만 실행)
    const deleteData = await prisma.articleImage.deleteMany({
      where: {
        id: {
          in: resourceIdToDelete,
        },
      },
    });

    console.log(`[DB] 총 ${deleteData.count}개의 미연결 ${logName}를 삭제했습니다.`);

    return orphanData;
  } catch (err) {
    return console.error(`[CRON ERROR] 미연결 ${logName} 삭제 중 오류 발생:`, err);
  }
};

// cron 작업 스케줄 설정
export const startCleanupJob = async () => {
  // --- 서버 시작 시 즉시 실행 ---
  // console.log('[CRON] 서버 시작: 초기 미연결 파일 즉시 삭제를 시작합니다.');
  // 병렬로 실행하여 대기 시간을 줄입니다. (두 작업이 서로 의존성이 없으므로)
  // await Promise.all([
  //   findAndDeleteOrphanUserImages(),
  //   findAndDeleteOrphanProductImages(),
  //   findAndDeleteOrphanArticleImages(),
  // ]);
  // console.log('[CRON] 서버 시작: 초기 미연결 파일 삭제가 완료되었습니다.');

  // 문서 삭제 스케줄: 매일 새벽 3시 00분
  cron.schedule(
    '0 3 * * *',
    async () => {
      await findAndDeleteOrphanUserImages();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  // 이미지 삭제 스케줄: 매일 새벽 3시 30분
  cron.schedule(
    '30 3 * * *',
    async () => {
      await findAndDeleteOrphanProductImages();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  // 이미지 삭제 스케줄: 매일 새벽 4시 00분
  cron.schedule(
    '0 4 * * *',
    async () => {
      await findAndDeleteOrphanArticleImages();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  console.log('[CRON] 미연결 파일 삭제 스케줄러가 시작되었습니다.');
};
