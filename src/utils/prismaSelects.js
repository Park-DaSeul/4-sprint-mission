// user 모델
export const meSelect = {
  id: true,
  email: true,
  nickname: true,
  image: true,
};

export const userSelect = {
  nickname: true,
};

// article 모델
export const articleSelect = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
};

// product 모델
export const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  tags: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
};

// comment 모델
export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};
