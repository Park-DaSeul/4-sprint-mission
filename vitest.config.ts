import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // describe, it, expect 등을 import 없이 사용
    globals: true,
    // 테스트 환경을 node로 설정
    environment: 'node',
    // 각 테스트 파일 실행 전에 실행할 파일 지정
    setupFiles: ['./src/config/env.config.ts'],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      // 'repository.ts'로 끝나는 모든 파일을 커버리지 측정 대상에서 제외합니다.
      exclude: [
        '**/*.repository.ts',
        '**/config/**',
        // '**/lib/socket.ts', // socket.ts도 11.76%로 낮으니 함께 제외하는 것을 고려
        // '**/middlewares/**', // 미들웨어 전체도 함께 제외 고려
        // '**/test/**' // 테스트 코드 자체는 측정에서 제외 (일반적)
        // 여기에 0%로 뜨는 파일들을 추가합니다.
      ],
    },
  },
});
