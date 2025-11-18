import { Router } from 'express';
import { authRouter } from '../modules/auth/index.js';
import { userRouter } from '../modules/users/index.js';
import { productRouter } from '../modules/products/index.js';
import { productCommentRouter } from '../modules/productComments/index.js';
import { articleRouter } from '../modules/articles/index.js';
import { articleCommentRouter } from '../modules/articleComments/index.js';
import { notificationRouter } from '../modules/notifications/index.js';
import { imageRouter } from '../modules/images/index.js';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/users', userRouter);
mainRouter.use('/products', productRouter);
mainRouter.use('/productComments', productCommentRouter);
mainRouter.use('/articles', articleRouter);
mainRouter.use('/articleComments', articleCommentRouter);
mainRouter.use('/notifications', notificationRouter);
mainRouter.use('/images', imageRouter);

export { mainRouter };
