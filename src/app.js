import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products/products.js';
import articlesRouter from './routes/articles/articles.js';

dotenv.config();

const app = express();

//cors 설정
const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:5173'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/products', productsRouter);
app.use('/articles', articlesRouter);

//전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '알 수 없는 에러' });
});

app.listen(process.env.PORT || 3000, () => console.log('서버 시작'));
