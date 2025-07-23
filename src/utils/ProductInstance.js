import { Product, ElectronicProduct } from '../classes/class.js';
import { getProductList } from '../services/ProductService.js';

// API에서 상품 목록을 가져와 조건에 따라 Product 또는 ElectronicProduct 인스턴스로 변환합니다.
// "전자제품" 태그가 포함된 상품은 ElectronicProduct로, 나머지는 Product로 생성됩니다.

export async function createProductInstances(params = {}) {
  const products = []; // 인스턴스화된 제품들을 저장할 배열

  try {
    // getProductList 함수를 호출하여 원본 상품 데이터를 가져옵니다.
    const rawApiResponse = await getProductList(params);

    const rawProductList = rawApiResponse.list; //  .list 중요! list안에 배열이 있음

    // 가져온 각 상품 데이터를 순회하며 인스턴스를 생성합니다.
    for (const rawProduct of rawProductList) {
      // tags 배열이 존재하고, 배열이며, "전자제품"을 포함하는지 확인합니다.
      const isElectronicProduct =
        Array.isArray(rawProduct.tags) && rawProduct.tags.includes('전자제품'); //결과값 (true or false)

      let productInstance;
      if (isElectronicProduct) {
        // "전자제품" 태그가 있다면 ElectronicProduct 인스턴스를 생성합니다.
        // ElectronicProduct 생성자는 Product의 속성들을 먼저 받고 manufacturer를 추가로 받습니다.
        productInstance = new ElectronicProduct(
          rawProduct.name,
          rawProduct.description,
          rawProduct.price,
          rawProduct.tags,
          rawProduct.images,
          rawProduct.favoriteCount,
          rawProduct.manufacturer, // ElectronicProduct에만 있는 속성
        );
      } else {
        // 그 외의 경우 Product 인스턴스를 생성합니다.
        productInstance = new Product(
          rawProduct.name,
          rawProduct.description,
          rawProduct.price,
          rawProduct.tags,
          rawProduct.images,
          rawProduct.favoriteCount,
        );
      }
      products.push(productInstance); // 생성된 인스턴스를 products 배열에 추가합니다.
    }

    console.log('성공적으로 인스턴스화된 제품 목록:', products);
    return products; // 인스턴스화된 제품 배열 반환
  } catch (error) {
    console.error('상품 인스턴스화 중 오류 발생:', error.message);
    throw error; // 오류를 다시 던져 상위 호출자에게 알립니다.
  }
}
