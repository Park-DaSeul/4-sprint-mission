//일반적인 제품의 속성을 정의하는 클래스입니다.
export class Product {
  #favoriteCount; // private 필드 선언: 찜하기 수

  constructor(name, description, price, tags, images) {
    this.name = name; //상품명
    this.description = description; //상품 설명
    this.price = price; //판매 가격
    this.tags = tags; //해시태그 배열
    this.images = images; //이미지 배열
    this.#favoriteCount = 0; //찜하기 수, 초기값 = 0
  }
  get favoriteCount() {
    return this.#favoriteCount;
  }
  //찜하기 수를 1 증가시키는 메서드입니다.
  favorite() {
    this.#favoriteCount++; // private 필드에 직접 접근
  }
}
//전자 제품의 속성을 정의하는 클래스입니다.
//Product 클래스를 상속받습니다.
export class ElectronicProduct extends Product {
  constructor(name, description, price, tags, images, manufacturer) {
    super(name, description, price, tags, images);
    this.manufacturer = manufacturer; //제조사
  }
}
//계시글의 속성을 정의하는 클래스입니다.
export class Article {
  #likeCount; // private 필드 선언: 좋아요 수

  constructor(title, content, writer) {
    this.title = title; //제목
    this.content = content; //내용
    this.writer = writer; //작성자
    this.#likeCount = 0; //좋아요 수
    this.createdAt = new Date(); //새로운 객체가 생성될때 현재 시간이 저장됨
  }
  get likeCount() {
    return this.#likeCount;
  }
  //좋아요 수를 1 증가 시키는 메서드입니다.
  like() {
    this.#likeCount++; // private 필드에 직접 접근
  }
}
