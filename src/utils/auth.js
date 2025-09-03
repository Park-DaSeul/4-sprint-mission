import bcrypt from 'bcryptjs';

// 비밀번호 확인
export const verifyPassword = async (plainPassword, hashedPassword) => {
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  if (!isValid) throw new Error('비밀번호가 일치하지 않습니다.');
};

// 비밀번호를 해시 처리하여 반환
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
