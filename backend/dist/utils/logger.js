"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = void 0;
const redis_1 = __importDefault(require("../config/redis"));
exports.logger = {
    info: (message, data) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "info",
            message,
            ...data,
        }, null, 2));
    },
    error: (message, error) => {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            message,
            error: error?.message || error,
        }, null, 2));
    },
};
// Middleware to log HTTP requests
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Add response time tracking
    const oldEnd = res.end;
    res.end = function (chunk, encoding, cb) {
        const responseTime = Date.now() - start;
        const logData = {
            responseTime: `${responseTime}ms`,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
        };
        // Log based on status code
        if (res.statusCode >= 400) {
            exports.logger.error("Request failed", logData);
        }
        else {
            exports.logger.info("Request completed", logData);
        }
        // only save the log data ont error
        try {
            redis_1.default.lpush("app:request:logs", JSON.stringify(logData));
        }
        catch (error) {
            console.error("Failed to save request log to Redis:", error);
        }
        return oldEnd.apply(res, [chunk, encoding, cb]);
    };
    next();
};
exports.requestLogger = requestLogger;
