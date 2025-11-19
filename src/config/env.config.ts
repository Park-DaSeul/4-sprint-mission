import dotenv from 'dotenv';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';

let envPath;

switch (NODE_ENV) {
  case 'production':
    envPath = path.resolve(process.cwd(), '.env.production');
    break;
  case 'test':
    envPath = path.resolve(process.cwd(), '.env.test');
    break;
  default: // 기본값: 'development'
    envPath = path.resolve(process.cwd(), '.env');
    break;
}

dotenv.config({ path: envPath });
