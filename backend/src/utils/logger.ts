import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";

interface LogData {
  method: string;
  path: string;
  responseTime: string;
  statusCode: number;
}

export const logger = {
  info: (message: string, data?: any) => {
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          level: "info",
          message,
          ...data,
        },
        null,
        2
      )
    );
  },

  error: (message: string, error?: any) => {
    console.error(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          level: "error",
          message,
          error: error?.message || error,
        },
        null,
        2
      )
    );
  },
};

// Middleware to log HTTP requests
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Add response time tracking
  const oldEnd = res.end;
  res.end = function (
    chunk?: any,
    encoding?: BufferEncoding | (() => void),
    cb?: () => void
  ) {
    const responseTime = Date.now() - start;
    const logData: LogData = {
      responseTime: `${responseTime}ms`,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      logger.error("Request failed", logData);
    } else {
      logger.info("Request completed", logData);
    }

    // only save the log data ont error
    try {
      redis.lpush("app:request:logs", JSON.stringify(logData));
    } catch (error) {
      console.error("Failed to save request log to Redis:", error);
    }
    return oldEnd.apply(res, [chunk, encoding as BufferEncoding, cb]);
  };

  next();
};
