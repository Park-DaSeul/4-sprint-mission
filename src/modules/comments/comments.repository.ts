import prisma from '../../libs/prisma.js';
import { userSelect, commentSelect } from '../../utils/index.js';
import type { GetCommentsRepositoryQuery, CreateCommentRepositoryData, UpdateCommentData } from './comments.dto.js';

// 모든 댓글 조회
export const getComments = async (commentsQuery: GetCommentsRepositoryQuery) => {
  const comments = await prisma.comment.findMany({
    ...commentsQuery,
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });

  return comments;
};

// 특정 댓글 조회
export const getCommentById = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: {
      ...commentSelect,
      user: {
        select: userSelect,
      },
    },
  });

  return comment;
};

// 댓글 생성
export const createComment = async (createData: CreateCommentRepositoryData) => {
  const comment = await prisma.comment.create({
    data: createData,
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
export const updateComment = async (id: string, updateData: Partial<UpdateCommentData>) => {
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
export const deleteComment = async (id: string) => {
  return await prisma.comment.delete({
    where: { id },
  });
};

// 댓글 존재 확인
export const findComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  return comment;
};
