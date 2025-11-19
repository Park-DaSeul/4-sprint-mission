import { config } from './config/config.js';
import http from 'http';
import { app } from './app.js';
import { initSocket } from './lib/socket.js';
import { startCleanupJob } from './lib/cron-jobs.js';

const server = http.createServer(app);
initSocket(server);

// Cron Job 활성화
startCleanupJob();

const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 시작되었습니다.`);
});
