import { io } from 'socket.io-client';

// 서버 주소를 입력
const SERVER_URL = 'http://localhost:3000';

// Access Token을 여기에 붙여넣기
const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGJhNjdlMC1jN2I4LTQxZGYtOTRhOC1kZDkwNzU2NjE0MmYiLCJpYXQiOjE3NjIyNjM3OTEsImV4cCI6MTc2MjI2NzM5MX0.d7_T_S8p1l993cih6LkSzg4JlMzkDKvqJWznrFfXwI8';

// 알림을 받을 사용자의 ID를 입력 (토큰에 해당하는 사용자 ID) 지금 필요없음
// const MY_USER_ID = '28ba67e0-c7b8-41df-94a8-dd907566142f';

// 서버에 연결
// auth.middleware.ts에서 쿠키를 통해 토큰을 읽으므로, 헤더에 쿠키 형식으로 토큰을 전달
const socket = io(SERVER_URL, {
  // extraHeaders 대신 auth 옵션을 사용하여 토큰을 전달
  auth: {
    token: ACCESS_TOKEN,
  },
});

// 연결 성공 시
socket.on('connect', () => {
  console.log(`✅ 서버에 성공적으로 연결되었습니다. (소켓 ID: ${socket.id})`);
});

// 'notification' 이벤트를 수신했을 때
socket.on('notification', (data) => {
  console.log('🔔 새로운 알림을 받았습니다:');
  console.log(data);
});

// 연결 에러 발생 시
socket.on('connect_error', (err) => {
  console.error('❌ 연결 에러:', err.message);
  console.error('인증 토큰이 유효한지, 서버가 실행 중인지 확인하세요.');
});

// 연결 끊어졌을 때
socket.on('disconnect', (reason) => {
  console.log(`🔌 서버와 연결이 끊어졌습니다. 사유: ${reason}`);
});

console.log('⏳ 서버에 연결을 시도합니다...');
