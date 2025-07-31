const BASE_URL = 'https://panda-market-api-crud.vercel.app'; //기본 URL입니다.

//Fetch 응답을 처리하고, 오류 발생 시 Error를 던지거나 JSON 데이터를 반환합니다.
//try catch로 확인 할수 없는 Error를 잡아내는 함수입니다.
export function handleResponse2(res) {
  if (!res.ok) {
    // 응답이 성공적이지 않은 경우 (예: 4xx, 5xx 상태 코드)
    return res.text().then((message) => {
      // 응답 본문을 텍스트로 읽어 오류 메시지로 사용합니다.
      throw new Error(message); // 새 Error 객체를 생성하여 던집니다.
    });
  }
  return res.json(); // 응답이 성공적이면 JSON 형태로 파싱하여 반환합니다.
}

//게시글 목록을 가져오는 함수입니다. 선택적으로 쿼리 파라미터를 받아 필터링할 수 있습니다.
export function getArticleList(params = {}) {
  const url = new URL(`${BASE_URL}/articles`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  );
  return fetch(url).then((res) => handleResponse2(res)); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 단일 게시글 정보를 가져오는 함수입니다.
export function getArticle(id) {
  return fetch(`${BASE_URL}/articles/${id}`).then((res) =>
    handleResponse2(res),
  ); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}
//새로운 게시글을 생성하는 함수입니다.
export function createArticle(articleData) {
  //@param {Object} articleData - 생성할 게시글의 데이터 객체
  return fetch(`${BASE_URL}/articles`, {
    method: 'POST', // HTTP POST 메서드를 사용합니다.
    body: JSON.stringify(articleData), // articleData 객체를 JSON 문자열로 변환하여 요청 본문에 포함합니다.
    headers: {
      // 요청 본문이 JSON 형식임을 서버에 알립니다.
      'Content-type': 'application/json',
    },
  }).then((res) => handleResponse2(res)); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 게시글의 일부 정보를 업데이트하는 함수입니다.
export function patchArticle(id, articleData) {
  return fetch(`${BASE_URL}/articles/${id}`, {
    method: 'PATCH', // HTTP PATCH 메서드를 사용합니다.
    body: JSON.stringify(articleData), // articleData 객체를 JSON 문자열로 변환하여 요청 본문에 포함합니다.
    headers: {
      // 요청 본문이 JSON 형식임을 서버에 알립니다.
      'Content-type': 'application/json',
    },
  }).then((res) => handleResponse2(res)); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 게시글을 삭제하는 함수입니다.
export function deleteArticle(id) {
  return fetch(`${BASE_URL}/articles/${id}`, {
    method: 'DELETE', // HTTP DELETE 메서드를 사용합니다.
  }).then((res) => handleResponse2(res)); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}
