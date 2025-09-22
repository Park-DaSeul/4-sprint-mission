# 🚀 UJU API 서버

스프린트 미션4

## ✨ 주요 기능

- **사용자 인증:** JWT를 사용한 안전한 사용자 회원가입 및 로그인.
- **상품 관리:** 상품 CRUD 기능.
- **게시글 관리:** 게시글 CRUD 기능.
- **댓글 시스템:** 상품 및 게시글에 대한 댓글 추가, 수정, 삭제.
- **좋아요 시스템:** 사용자는 상품 및 게시글에 좋아요/좋아요 취소를 할 수 있습니다.
- **마이페이지 시스템:** 사용자가 등록한 상품 목록, 좋아요 누른 상품 목록 조회.
- **이미지 업로드:** 사용자의 프로필, 상품, 게시글 이미지 업로드.

## 🛠️ 사용 기술

- **백엔드:** Node.js, Express.js
- **데이터베이스:** PostgreSQL (Prisma ORM으로 관리)
- **인증:** Passport.js (JWT & Local Strategies)
- **유효성 검사:** zod
- **파일 업로드:** multer

## 📂 프로젝트 구조

```
/home/seuli/4-sprint-mission/
├── prisma/              # Prisma 스키마, 마이그레이션
├── src/
│   ├── controllers/     # 요청 핸들러
│   ├── libs/            # 재사용 가능한 라이브러리 (Prisma 클라이언트, Passport 설정)
│   ├── middlewares/     # Express 미들웨어 (에러 핸들링, 유효성 검사)
│   ├── routes/          # API 라우트 정의
│   ├── services/        # 비즈니스 로직
│   ├── utils/           # 유틸리티 함수
│   └── validations/     # 요청 유효성 검사 스키마
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ 시작하기

### 사전 요구 사항

- Node.js (v18 이상 권장)
- npm
- PostgreSQL

### 설치 및 설정

1.  **저장소 클론:**

    ```bash
    git clone https://github.com/Park-DaSeul/4-sprint-mission.git
    cd 4-sprint-mission
    ```

2.  **의존성 설치:**

    ```bash
    npm install
    ```

3.  **환경 변수 설정:**

    루트 디렉토리에 `.env` 파일을 생성하고 다음 변수를 추가하세요. 플레이스홀더 값을 실제 데이터베이스 정보로 교체해야 합니다.

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    JWT_ACCESS_TOKEN_SECRET="YOUR_JWT_SECRET"
    JWT_REFRESH_TOKEN_SECRET="YOUR_JWT_SECRET"
    ```

4.  **데이터베이스 마이그레이션 실행:**
    ```bash
    npx prisma migrate depoly
    ```

## 🚀 사용법

개발 서버를 시작합니다:

```bash
npm run build
npm run start
```

서버는 `http://localhost:3000` (또는 환경에 지정된 포트)에서 시작됩니다.

## 📝 API 엔드포인트

사용 가능한 API 엔드포인트에 대한 간략한 개요입니다. 더 자세한 예시는 `http/` 디렉토리를 참조하세요.

### 인증 (Auth)

- `POST /auth/signup`: 새 사용자 등록.
- `POST /auth/login`: 사용자 로그인 및 JWT 토큰 발급.
- `POST /auth/logout`: 사용자 로그아웃.
- `POST /auth/refresh`: JWT 토큰 갱신.

### 사용자 (Users)

- `GET /users/me/products`: 현재 사용자가 등록한 상품 가져오기.
- `GET /users/me/likess`: 현재 사용자가 좋아요한 상품 가져오기.

### 상품 (Products)

- `GET /products`: 상품 목록 가져오기.
- `POST /products`: 새 상품 생성 (인증 필요).
- `GET /products/:productId`: 단일 상품 가져오기 (인증 필요).
- `PUT /products/:productId`: 상품 정보 수정 (인증 필요).
- `DELETE /products/:productId`: 상품 삭제 (인증 필요).

### 상품 댓글 & 좋아요

- `POST /products/:productId/comments`: 상품에 댓글 추가.
- `PUT /comments/:commentId`: 댓글 수정.
- `DELETE /comments/:commentId`: 댓글 삭제.
- `POST /products/:productId/like`: 상품 좋아요/좋아요 취소.

### 게시글 (Articles)

- `GET /articles`: 게시글 목록 가져오기.
- `POST /articles`: 새 게시글 생성 (인증 필요).
- `GET /articles/:articleId`: 단일 게시글 가져오기 (인증 필요).
- `PUT /articles/:articleId`: 게시글 정보 수정 (인증 필요).
- `DELETE /articles/:articleId`: 게시글 삭제 (인증 필요).

### 게시글 댓글 & 좋아요

- `POST /articles/:articleId/comments`: 게시글에 댓글 추가.
- `PUT /comments/:commentId`: 댓글 수정.
- `DELETE /comments/:commentId`: 댓글 삭제.
- `POST /articles/:articleId/like`: 게시글 좋아요/좋아요 취소.

## 🤝 기여 방법

기여를 환영합니다! 언제든지 Pull Request를 제출해주세요.

1.  저장소를 Fork 하세요.
2.  기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`).
3.  변경 사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`).
4.  브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`).
5.  Pull Request를 생성하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다.
