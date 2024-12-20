import Redis from "ioredis";
import { logger } from "../utils/logger";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env") });

console.log({
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
});

redis.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  logger.info("Redis Client Connected");
});

export default redis;
