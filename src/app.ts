import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { initSocket } from './lib/socket.js';
import passport from './lib/passport/index.js';
import { mainRouter } from './routes/mainRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { startCleanupJob } from './lib/cron-jobs.js';
import { corsOptions } from './config/cors.config.js';
import { configureCloudinary } from './config/cloudinary.config.js';

dotenv.config();

const app = express();
//웹소켓 설정
const server = http.createServer(app);
initSocket(server);

// cors 설정
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Cloudinary 환경 설정
configureCloudinary();

app.use(passport.initialize());

app.use(mainRouter);

// Cron Job 활성화
startCleanupJob();

app.use(errorHandler);

server.listen(process.env.PORT || 3000, () => console.log('서버 시작'));
