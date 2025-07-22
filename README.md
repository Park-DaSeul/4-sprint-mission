# **🚀 UjU API Client**

스프린트 미션2

## **📝 소개 (Introduction)**

클래스와 함수를 이용하여 API를 만들어 서버에 리퀘스트를 보내고 리스폰스를 받아 정리하는 코드를 구현했습니다. Git과 GitHub를 이용하여 추후 협업에 필요한 기본적인 기능을 숙지하는 데 도움이 되었습니다.

- **프로젝트의 목적:** API 리퀘스트를 보내는 코드를 구현했습니다.
- **주요 기능:** Article API 및 Product API를 이용하며, 특히 Product에서 해시태그 "전자제품" 상품을 분리하는 기능을 제공합니다.
- **기술 스택:** Node.js, JavaScript, Fetch API, 클래스(Class) 기반의 객체 지향 프로그래밍을 활용하여 개발되었습니다.

## **✨ 주요 기능 (Features)**

- **기능 1:** Article API에서 GET, POST, PATCH, DELETE의 메소드가 구현되어 있습니다.
- **기능 2:** Product API에서 GET, POST, PATCH, DELETE의 메소드가 구현되어 있습니다.
- **기능 3:** Product의 GET 메소드로 받아온 상품 리스트에서 해시태그 “전자제품”이 포함되어 있는 상품을 `ElectronicProduct` 클래스를 사용해 따로 분류할 수 있습니다.

## **📦 설치 방법 (Installation)**

실행 환경은 Node.js 입니다. 아래 단계를 따라 프로젝트를 설치할 수 있습니다.

```
1. 저장소 클론
git clone https://github.com/Park-DaSeul/project1.git
cd project1

2. 의존성 설치 (필요한 경우)
npm install
```

## **🚀 사용 방법 (Usage)**

프로젝트를 실행하는 방법은 간단합니다.

```
# 프로젝트 실행
node main.js
```

`main.js` 파일 안에 예시 실행 코드가 포함되어 있습니다. 다양한 API 메소드를 테스트하려면 `services/ProductService.js` 및 `services/ArticleService.js` 파일을 참조하여 직접 코드를 작성해 볼 수 있습니다.

## **🤝 기여 방법 (Contributing)**

이 프로젝트에 대한 모든 기여와 피드백을 환영합니다\! 개선 사항이나 새로운 기능을 제안하고 싶으시다면, 아래 절차에 따라 Pull Request를 생성해 주세요.

1. 이 저장소를 [Fork](https://www.google.com/search?q=https://docs.github.com/ko/pull-requests/collaborating-with-pull-requests/getting-started/about-forks) 합니다.
   - **Fork된 저장소의 URL은 다음과 같을 것입니다:** `https://github.com/Park-DaSeul/project1`
2. 새로운 기능/버그 수정을 위한 브랜치를 생성합니다. `(git switch \-c feature/my-awesome-feature)`
3. 변경 사항을 커밋하고 푸시합니다.
4. Pull Request를 생성하여 변경 내용을 제안합니다.

## **📄 라이선스 (License)**

이 프로젝트는 MIT License 하에 라이선스됩니다.
