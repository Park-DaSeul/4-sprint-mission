// Services
import { ImageService } from './image.service.js';

// Controllers
import { ImageController } from './image.controller.js';

// 의존성 주입
const imageService = new ImageService();

export const imageController = new ImageController(imageService);
