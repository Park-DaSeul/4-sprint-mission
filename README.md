# **🚀 UJU API Client**

스프린트 미션3

## **📝 소개 (Introduction)**

Products, Articles의 API를 만들었습니다. CRUD 라우터를 통해 생성, 수정 삭제, Keyword검색 등이 가능하고, image 파일을 업로드 할수 있습니다. Comment 기능을 구현하여 댓글을 생성, 수정, 삭제 할수 있습니다.

- **프로젝트의 목적:** Products와 Articles의 API 코드를 구현했습니다.
- **주요 기능:** Products, Articles의 CRUD 라우터를 사용하여, 생성, 수정, 검색, image 업로드 기능을 제공합니다.
- **기술 스택:** Node.js, JavaScript, Express, Prisma 기반의 객체 지향 프로그래밍을 활용하여 개발되었습니다.

## **✨ 주요 기능 (Features)**

- **기능 1:** Products API에서 CRUD의 라우터가 구현되어 있습니다. POST를 통해 image 업로드가 가능합니다.
- **기능 2:** Articles API에서 CRUD의 라우터가 구현되어 있습니다. POST를 통해 image 업로드가 가능합니다.
- **기능 3:** Products, Articles의 Comment 기능을 구현하여 댓글을 자유롭게 생성, 수정, 삭제 할수 있습니다.

## **📦 설치 방법 (Installation)**

실행 환경은 Node.js 입니다. 아래 단계를 따라 프로젝트를 설치할 수 있습니다.

```
1. 의존성 설치
npm install
npx prisma migrate dev
npx prisma db seed
```

## **🚀 사용 방법 (Usage)**

URL 주소에 엔드포인트를 작성하면 작동합니다.

```
# 프로젝트 실행
npm run dev

# 엔드포인트 목록
/products, /products/:productId/comments
/articles, /articles/:articleId/comments

# test.http파일 이용
test.http파일에 기본적인 URL 주소가 입력되어 있습니다.
```

## **🤝 기여 방법 (Contributing)**

이 프로젝트에 대한 모든 기여와 피드백을 환영합니다\! 개선 사항이나 새로운 기능을 제안하고 싶으시다면, 아래 절차에 따라 Pull Request를 생성해 주세요.

1. 이 저장소를 [Fork](https://www.google.com/search?q=https://docs.github.com/ko/pull-requests/collaborating-with-pull-requests/getting-started/about-forks) 합니다.
   - **Fork된 저장소의 URL은 다음과 같을 것입니다:** `https://github.com/my-username/4-sprint-mission.git`
2. 새로운 기능/버그 수정을 위한 브랜치를 생성합니다. `(git switch \-c feature/my-awesome-feature)`
3. 변경 사항을 커밋하고 푸시합니다.
4. Pull Request를 생성하여 변경 내용을 제안합니다.

## **📄 라이선스 (License)**

이 프로젝트는 MIT License 하에 라이선스됩니다.
