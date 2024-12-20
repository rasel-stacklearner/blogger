import pino from "pino";
import pinoHttp from "pino-http";
import { IncomingMessage, ServerResponse } from "http";

interface ResponseWithTime extends ServerResponse<IncomingMessage> {
  responseTime?: number;
}

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname,reqId",
      messageFormat: "{msg}",
    },
  },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: false,
  customSuccessMessage: function (req: IncomingMessage, res: ResponseWithTime) {
    return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
  },
  customErrorMessage: function (
    req: IncomingMessage,
    res: ResponseWithTime,
    error: Error
  ) {
    return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms - Error: ${error.message}`;
  },
  customProps: function (_req: IncomingMessage, _res: ResponseWithTime) {
    return {
      // Return empty object to remove additional props
    };
  },
});
