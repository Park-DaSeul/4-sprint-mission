import {
  handleResponse1,
  getProductList,
  getProduct,
  createProduct,
  patchProduct,
  deleteProduct,
} from './services/ProductService.js';
import {
  handleResponse2,
  getArticleList,
  getArticle,
  createArticle,
  patchArticle,
  deleteArticle,
} from './services/ArticleService.js';
import { createProductInstances } from './utils/ProductInstance.js'; //인스턴스 protucts 배열 만드는곳
import { Product, ElectronicProduct, Article } from './classes/class.js'; //클래스

//getProductList() 를 통해 받아온 상품리스트를 각각 인스턴스로 만들어 products 배열에 저장하는 함수
async function main() {
  try {
    const newProducts = await createProductInstances(); //ProductInstance.js 파일로 연결
    console.log('성공적으로 인스턴스화된 제품 목록:', newProducts);
  } catch (error) {
    console.error('메인 실행 중 오류 발생:', error);
  }
}

main();

//Article 목록 불러오기를 서버에 요청하는 함수
async function getNewArticleList(params) {
  try {
    const getedArticle = await getArticleList(params);
    console.log('게시물을 성공적으로 불러왔습니다:', getedArticle); //성공 확인 메세지
  } catch (error) {
    console.error('게시물을 불러오는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

getNewArticleList({ page: 1, pageSize: 10, keyword: 'AI' });

//특정 Article 목록 불러오기를 서버에 요청하는 함수
async function getNewArticle(id) {
  try {
    const getedArticle = await getArticle(id);
    console.log('게시물을 성공적으로 불러왔습니다:', getedArticle); //성공 확인 메세지
  } catch (error) {
    console.error('게시물을 불러오는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

getNewArticle(20);

//새로운 Article 만드는것을 서버에 요청하는 함수
async function addNewArticle() {
  const newArticletData = {
    title: 'AI란 무엇인가',
    content: '최신 과학 기술집입니다.',
    image: 'https://example.com/...',
  };

  try {
    const createdArticle = await createArticle(newArticletData);
    console.log('게시물이 성공적으로 생성되었습니다:', createdArticle); //성공 확인 메세지
  } catch (error) {
    console.error('게시물 생성 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

addNewArticle();

//특정 Article의 수정하기를 서버에 요청하는 함수
async function patchNewArticle(id) {
  const newArticletData = {
    title: '코딩이란 무엇인가',
    content: '최신 코딩 기술집입니다.',
    image: 'https://example.com/...',
  };

  try {
    const modifyedArticle = await patchArticle(id, newArticletData);
    console.log('게시물이 성공적으로 수정되었습니다:', modifyedArticle); //성공 확인 메세지
  } catch (error) {
    console.error('게시물 수정 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

patchNewArticle(20);

//특정 Article 목록 삭제하기를 서버에 요청하는 함수
async function deleteNewArticle(id) {
  try {
    const deltedArticle = await deleteArticle(id);
    console.log('게시물을 성공적으로 삭제했습니다:', deltedArticle); //성공 확인 메세지
  } catch (error) {
    console.error('게시물을 삭제하는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

deleteNewArticle(10);

//////////////////////////////////////////////
//////////////////////////////////////////////
//Product 목록 불러오기를 서버에 요청하는 함수
async function getNewProductList(params) {
  try {
    const getedProduct = await getProductList(params);
    console.log('제품을 성공적으로 불러왔습니다:', getedProduct); //성공 확인 메세지
  } catch (error) {
    console.error('제품을 불러오는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

getNewProductList({ page: 1, pageSize: 10, keyword: 'AI' });

//특정 Product 목록 불러오기를 서버에 요청하는 함수
async function getNewProduct(id) {
  try {
    const getedProduct = await getProduct(id);
    console.log('제품을 성공적으로 불러왔습니다:', getedProduct); //성공 확인 메세지
  } catch (error) {
    console.error('제품을 불러오는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

getNewProduct(20);

//새로운 Product 만드는것을 서버에 요청하는 함수
async function addNewProduct() {
  const newProductData = {
    name: 'test 스마트폰',
    description: '최신 기술이 집약된 test 스마트폰입니다.',
    price: 11000,
    tags: ['스마트폰', '전자제품', '신제품'],
    images: ['https://example.com/...'],
  };

  try {
    const createdProduct = await createProduct(newProductData);
    console.log('제품이 성공적으로 생성되었습니다:', createdProduct); //성공 확인 메세지
  } catch (error) {
    console.error('제품 생성 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

addNewProduct();

//특정 Product의 수정하기를 서버에 요청하는 함수
async function patchNewProduct(id) {
  const newProductData = {
    name: 'patch test ',
    description: '가격이 착한 스마트폰입니다.',
    price: 2000000,
    tags: ['스마트폰', '전자제품', '명품'],
    images: ['https://example.com/...'],
  };

  try {
    const modifyedProduct = await patchProduct(id, newProductData);
    console.log('제품이 성공적으로 수정되었습니다:', modifyedProduct); //성공 확인 메세지
  } catch (error) {
    console.error('제품 수정 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

patchNewProduct(20);

//특정 Product 목록 삭제하기를 서버에 요청하는 함수
async function deleteNewProduct(id) {
  try {
    const deletedProduct = await deleteProduct(id);
    console.log('제품을 성공적으로 삭제했습니다:', deletedProduct); //성공 확인 메세지
  } catch (error) {
    console.error('제품을 삭제하는 중 오류 발생:', error.message); //실패 확인 메세지
  }
}

deleteNewProduct(10);

////////////////////////////////////////////
/////////////클래스 생성//////////////////////
////////////////////////////////////////////
//새로운 Product 인스턴스 생성
const newProduct = new Product(
  '운동화',
  '편안한 운동화입니다.',
  75000, // 가격
  ['신발', '운동'], // 태그 배열
  ['image1.jpg', 'image2.jpg'], // 이미지 URL 배열
);

console.log('상품명:', newProduct.name);
console.log('가격:', newProduct.price);
console.log('현재 찜하기 수:', newProduct.favoriteCount);

// favorite() 메서드 호출
newProduct.favorite();
console.log('찜하기 후 찜하기 수:', newProduct.favoriteCount);

// 모든 속성 확인
console.log('myProduct 객체:', newProduct);

//새로운 ElectronicProduct 인스턴스 생성
const newElectronicProduct = new ElectronicProduct(
  'AI스마트폰',
  '고성능 스마트폰입니다.',
  1200000, // 가격
  ['전자제품', '스마트폰'], // 태그 배열
  ['phone1.jpg', 'phone2.jpg'], // 이미지 URL 배열
  '꾸끌', // 제조사 (ElectronicProduct의 추가 속성)
);

console.log('전자제품명:', newElectronicProduct.name);
console.log('제조사:', newElectronicProduct.manufacturer);
console.log('현재 찜하기 수:', newElectronicProduct.favoriteCount);

// favorite() 메서드 호출 (Product 클래스에서 상속받음)
newElectronicProduct.favorite();
console.log('찜하기 후 찜하기 수:', newElectronicProduct.favoriteCount);

console.log('myElectronicProduct 객체:', newElectronicProduct);

// 새로운 Article 인스턴스 생성
const newArticle = new Article(
  'AI 기술 트렌드',
  '2025년 AI분석입니다.',
  '노벨', // 작성자
);

console.log('게시글 제목:', newArticle.title);
console.log('작성자:', newArticle.writer);
console.log('현재 좋아요 수:', newArticle.likeCount);
console.log('생성일자:', newArticle.createdAt); // createdAt은 Date 객체입니다.

// like() 메서드 호출
newArticle.like();
console.log('좋아요 후 좋아요 수:', newArticle.likeCount);

console.log('myArticle 객체:', newArticle);
