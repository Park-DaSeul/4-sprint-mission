import prisma from '../libs/prisma.js';

// id로 레코드 가져오기
// 사용예문
// const userData = await getOneByIdOrFail(prisma.user, userId, '사용자', include: { posts: true });
// const postData = await getOneByIdOrFail(prisma.post, postId, '게시물');
export const getOneByIdOrFail = async (model, id, modelName, options = {}) => {
  const record = await model.findUnique({
    where: { id },
    ...options, // select와 include 옵션을 여기에 적용
  });
  if (!record) throw new Error(`${modelName}를 찾을 수 없습니다.`);
  return record;
};

// 이메일로 사용자 가져오기
export const getUserByEmailOrFail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');
  return user;
};

// 특정 이메일을 가진 사용자가 존재하는지 확인
export const checkUserExistsByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  // 사용자가 존재하면 해당 객체를 반환하고, 아니면 null을 반환합니다.
  return user;
};
