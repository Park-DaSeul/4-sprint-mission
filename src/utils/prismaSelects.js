// auth + user
export const meSelect = {
  id: true,
  email: true,
  nickname: true,
  imageUrl: true,
};

export const userSelect = {
  nickname: true,
};

// article
export const articleSelect = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
};

// product
export const productSelect = {
  id: true,
  productName: true,
  description: true,
  price: true,
  tags: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
};

// comment
export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

// articltLike
export const articleLikeSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
};

// productLike
export const productLikeSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
};
