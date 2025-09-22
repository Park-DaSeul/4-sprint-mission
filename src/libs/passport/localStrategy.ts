import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
import type { VerifyFunction } from 'passport-local';

const verifyCallback: VerifyFunction = async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return done(null, user);
      }
    }

    // 사용자를 찾지 못했거나 비밀번호가 틀린 경우
    return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  } catch (error) {
    done(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'), false);
  }
};

export const localStrategy = new LocalStrategy({ usernameField: 'email' }, verifyCallback);
