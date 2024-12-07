import { RedisOptions } from 'ioredis';
import dotenv from "dotenv";

dotenv.config();

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT as unknown as number,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export default redisConfig;
