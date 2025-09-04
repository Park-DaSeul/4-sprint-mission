import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './libs/passport/index.js';
import { userRouter } from './routes/user.route.js';
import { productRouter } from './routes/product.route.js';
import { articleRouter } from './routes/article.route.js';
import { commentRouter } from './routes/comment.route.js';
import { authRouter } from './routes/auth.route.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

//cors 설정
const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:5173'],
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.use(errorHandler); //전역 에러핸들러

app.listen(process.env.PORT, () => console.log('서버 시작'));
