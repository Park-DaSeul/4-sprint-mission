import { UserService } from './user.service.js';
import type { Response } from 'express';
import type {
  GetUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  GetUserProductRequest,
  GetUserLikeRequest,
} from './user.dto.js';

export class UserController {
  constructor(private userService: UserService) {}

  // 사용자 조회
  public getUser = async (req: GetUserRequest, res: Response) => {
    const { id } = req.user;

    const user = await this.userService.getUser(id);
    return res.status(200).json({ success: true, data: user });
  };

  // 사용자 수정
  public updateUser = async (req: UpdateUserRequest, res: Response) => {
    const { id } = req.user;

    const resource = req.user;

    const data = req.parsedBody;
    const user = await this.userService.updateUser(id, data, resource);
    return res.status(200).json({ success: true, data: user });
  };

  // 사용자 삭제
  public deleteUser = async (req: DeleteUserRequest, res: Response) => {
    const { id } = req.user;

    const resource = req.user;

    const data = req.parsedBody;
    await this.userService.deleteUser(id, data, resource);
    return res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
  };

  // 사용자가 등록한 상품 조회
  public getUserProduct = async (req: GetUserProductRequest, res: Response) => {
    const { id } = req.user;

    const userData = await this.userService.getUserProduct(id);
    return res.status(200).json({ success: true, data: userData });
  };

  // 사용자가 좋아요 누른 상품 조회
  public getUserLike = async (req: GetUserLikeRequest, res: Response) => {
    const { id } = req.user;

    const userData = await this.userService.getUserLike(id);
    return res.status(200).json({ success: true, data: userData });
  };
}
