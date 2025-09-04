import prisma from '../libs/prisma.js';
import { getOneByIdOrFail, userSelect, commentSelect } from '../utils/index.js';

// 모든 댓글 조회
export const getComments = async (query) => {
  const { articleId, productId, limit = 10, cursor, search } = query;
  // 페이지 네이션 커서방식
  const where = {};
  if (articleId) where.articleId = articleId;
  if (productId) where.productId = productId;
  if (search) {
    where.content = { contains: search, mode: 'insensitive' };
  }

  const comments = await prisma.comment.findMany({
    where,
    take: parseInt(limit, 10) || 10,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });

  const lastCommentInResults = comments[comments.length - 1];
  const nextCursor = lastCommentInResults ? lastCommentInResults.id : null;

  return { comments, nextCursor };
};

// 특정 댓글 조회
export const getCommentById = async (id) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');
  return comment;
};

// 댓글 생성
export const createComment = async (userId, data) => {
  const { content, articleId, productId } = data;

  let type;
  let resourceId;

  // switch 문을 사용하여 type과 resourceId를 결정
  switch (true) {
    case !!articleId:
      type = 'ARTICLE';
      resourceId = articleId;
      break;
    case !!productId:
      type = 'PRODUCT';
      resourceId = productId;
      break;
    default:
      // articleId와 productId 둘 다 없는 경우
      throw new Error('Article ID 또는 Product ID가 필요합니다.');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      type,
      ...(type === 'ARTICLE' && { articleId: resourceId }),
      ...(type === 'PRODUCT' && { productId: resourceId }),
      userId,
    },
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });
  return comment;
};

// 댓글 수정
export const updateComment = async (id, userId, data) => {
  const { content } = data;
  // 댓글이 존재하는지 확인
  const commentData = await getOneByIdOrFail(prisma.comment, id, '댓글');
  if (commentData.userId !== userId) {
    throw new Error('댓글을 수정할 권한이 없습니다.');
  }

  const updateData = {
    ...(content && { content }),
  };

  const comment = await prisma.comment.update({
    where: { id },
    data: updateData,
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });
  return comment;
};

// 댓글 삭제
export const deleteComment = async (id, userId) => {
  // 댓글이 존재하는지 확인
  const commentData = await getOneByIdOrFail(prisma.comment, id, '댓글');
  if (commentData.userId !== userId) {
    throw new Error('댓글을 삭제할 권한이 없습니다.');
  }

  await prisma.comment.delete({
    where: { id },
  });
};
