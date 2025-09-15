import * as commentRepository from './comments.repository.js';
import type { Prisma } from '@prisma/client';
import type {
  GetCommentsQuery,
  GetCommentsRepositoryQuery,
  CreateCommentData,
  CreateCommentRepositoryData,
  UpdateCommentData,
} from './comments.dto.js';

// 모든 댓글 조회
export const getComments = async (query: GetCommentsQuery, resourceId: string, resourceType: 'ARTICLE' | 'PRODUCT') => {
  const { limit: take = 10, cursor, search } = query;

  // 페이지 네이션 커서방식
  let where: Prisma.CommentWhereInput = {
    ...(resourceType === 'ARTICLE' && { articleId: resourceId }),
    ...(resourceType === 'PRODUCT' && { productId: resourceId }),
  };
  if (search) {
    where = {
      OR: [{ content: { contains: search, mode: 'insensitive' } }],
    };
  }

  const commentsQuery: GetCommentsRepositoryQuery = {
    where,
    take,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' },
  };

  const comments = await commentRepository.getComments(commentsQuery);

  const lastCommentInResults = comments[comments.length - 1];
  const nextCursor = lastCommentInResults ? lastCommentInResults.id : null;

  return { comments, nextCursor };
};

// 특정 댓글 조회
export const getCommentById = async (id: string) => {
  const comment = await commentRepository.getCommentById(id);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  return comment;
};

// 댓글 생성
export const createComment = async (resourceId: string, userId: string, data: CreateCommentData) => {
  const { content, resourceType } = data;

  const createData: CreateCommentRepositoryData = {
    content,
    type: resourceType,
    ...(resourceType === 'ARTICLE' && { articleId: resourceId }),
    ...(resourceType === 'PRODUCT' && { productId: resourceId }),
    userId,
  };

  const comment = await commentRepository.createComment(createData);

  return comment;
};

// 댓글 수정
export const updateComment = async (id: string, userId: string, data: UpdateCommentData) => {
  const { content } = data;

  // 댓글 존재 확인
  const commentData = await commentRepository.findComment(id);
  if (!commentData) throw new Error('댓글을 찾을 수 없습니다.');
  if (commentData.userId !== userId) throw new Error('댓글을 수정할 권한이 없습니다.');

  const updateData: UpdateCommentData = {
    ...(content && { content }),
  };

  const comment = await commentRepository.updateComment(id, updateData);

  return comment;
};

// 댓글 삭제
export const deleteComment = async (id: string, userId: string) => {
  // 댓글 존재 확인
  const commentData = await commentRepository.findComment(id);
  if (!commentData) throw new Error('댓글을 찾을 수 없습니다.');
  if (commentData.userId !== userId) throw new Error('댓글을 삭제할 권한이 없습니다.');

  return await commentRepository.deleteComment(id);
};
