// user 모델
export const userSelect = {
  id: true,
  name: true,
  nickname: true,
  email: true,
};

// dish 모델
export const dishSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
};

// comment 모델
export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userSelect,
  },
};

// recipe 모델
export const recipeSelect = {
  id: true,
  stepNumber: true,
  instruction: true,
  imageUrl: true,
  duration: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id },
  },
};
