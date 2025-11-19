import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './lib/passport/index.js';
import { mainRouter } from './routes/mainRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { corsOptions } from './config/cors.config.js';
import { configureCloudinary } from './config/cloudinary.config.js';

const app = express();

// cors 설정
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Cloudinary 환경 설정
configureCloudinary();

app.use(passport.initialize());

app.use(mainRouter);

app.use(errorHandler);

export { app };
