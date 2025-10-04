import { Router } from 'express';
import { authRouter } from '../modules/auth/index.js';
import { userRouter } from '../modules/users/index.js';
import { userImageRouter } from '../modules/userImages/index.js';
import { productRouter } from '../modules/products/index.js';
import { productImageRouter } from '../modules/productImages/index.js';
import { productCommentRouter } from '../modules/productComments/index.js';
import { articleRouter } from '../modules/articles/index.js';
import { articleImageRouter } from '../modules/articleImages/index.js';
import { articleCommentRouter } from '../modules/articleComments/index.js';
import { notificationRouter } from '../modules/notifications/index.js';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/users', userRouter);
mainRouter.use('/userImages', userImageRouter);
mainRouter.use('/products', productRouter);
mainRouter.use('/productImages', productImageRouter);
mainRouter.use('/productComments', productCommentRouter);
mainRouter.use('/articles', articleRouter);
mainRouter.use('/articleImages', articleImageRouter);
mainRouter.use('/articleComments', articleCommentRouter);
mainRouter.use('/notifications', notificationRouter);

export { mainRouter };
