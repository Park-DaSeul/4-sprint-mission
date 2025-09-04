import * as userService from '../services/user.service.js';

// 사용자 조회
export const getUser = async (req, res) => {
  const { id } = req.user;
  const user = await userService.getUser(id);
  res.json({ success: true, data: user });
};

// 사용자 수정
export const updateUser = async (req, res) => {
  const { id } = req.user;
  const data = req.body;
  const user = await userService.updateUser(id, data);
  res.json({ success: true, data: user });
};

// 사용자 삭제
export const deleteUser = async (req, res) => {
  const { id } = req.user;
  const data = req.body;
  await userService.deleteUser(id, data);
  res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
};

// 사용자가 등록한 상품 목록 조회
export const getUserProducts = async (req, res) => {
  const { id } = req.user;
  const user = await userService.getUserProducts(id);
  res.json({ success: true, data: user });
};
