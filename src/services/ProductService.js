const BASE_URL = 'https://panda-market-api-crud.vercel.app'; //기본 URL입니다.

//Fetch 응답을 처리하고, 오류 발생 시 Error를 던지거나 JSON 데이터를 반환합니다.
//try catch로 확인 할수 없는 Error를 잡아내는 함수입니다.
export async function handleResponse1(res) {
  if (!res.ok) {
    // 응답이 성공적이지 않은 경우 (예: 4xx, 5xx 상태 코드)
    const message = await res.text(); // 응답 본문을 텍스트로 읽어 오류 메시지로 사용합니다.
    throw new Error(message); // 새 Error 객체를 생성하여 던집니다.
  }
  const data = await res.json(); // 응답이 성공적이면 JSON 형태로 파싱하여 반환합니다.
  return data;
}

//제품 목록을 가져오는 함수입니다. 선택적으로 쿼리 파라미터를 받아 필터링할 수 있습니다.
export async function getProductList(params = {}) {
  const url = new URL(`${BASE_URL}/products`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  ); //Object.keys(params)가 배열을 만들어줌, URL에 쿼리를 연결해줌

  const res = await fetch(url); //실제로 용청을 보내는 역할
  return handleResponse1(res); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 단일 제품 정보를 가져오는 함수입니다.
export async function getProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return handleResponse1(res); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//새로운 제품을 생성하는 함수입니다.
export async function createProduct(productData) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST', // HTTP POST 메서드를 사용합니다.
    body: JSON.stringify(productData), // productData 객체를 JSON 문자열로 변환하여 요청 본문에 포함합니다.
    headers: {
      // 요청 본문이 JSON 형식임을 서버에 알립니다.
      'Content-Type': 'application/json',
    },
  });
  return handleResponse1(res); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 제품의 일부 정보를 업데이트하는 함수입니다.
export async function patchProduct(id, productData) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse1(res); // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}

//특정 ID를 가진 제품을 삭제하는 함수입니다.
export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  const result = await handleResponse1(res);
  console.log(`Product ID ${id} 삭제 완료.`); // 삭제 성공 메시지를 출력합니다.
  return result; // 응답을 handleResponse 함수로 넘겨 오류 처리 및 JSON 파싱을 합니다.
}
