import * as dotenv from 'dotenv';
import express from 'express';
import productsRouter from './routes/products.js';
import articlesRouter from './routes/articles.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/products', productsRouter);
app.use('/articles', articlesRouter);

//전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '알 수 없는 에러' });
});

app.listen(process.env.PORT || 3000, () => console.log('서버 시작'));
