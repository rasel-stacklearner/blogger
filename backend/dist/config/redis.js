"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, "../../.env") });
console.log({
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
});
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
});
redis.on("error", (err) => {
    logger_1.logger.error("Redis Client Error:", err);
});
redis.on("connect", () => {
    logger_1.logger.info("Redis Client Connected");
});
exports.default = redis;
