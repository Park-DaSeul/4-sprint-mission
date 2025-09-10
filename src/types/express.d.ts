import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends PrismaUser {}

    interface Request {
      user?: User;
      validatedData?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}
