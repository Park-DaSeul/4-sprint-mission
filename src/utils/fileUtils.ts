import fs from 'fs';
import util from 'util';

const unlinkFile = util.promisify(fs.unlink);

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await unlinkFile(filePath);
      console.log(`파일 삭제 완료: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    throw new Error('파일 삭제 중 오류가 발생했습니다.');
  }
};
