"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./utils/logger");
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.requestLogger);
// Routes
app.use("/api", posts_1.default);
app.use("/api", users_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error(err?.message);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(port, () => {
    logger_1.logger.info(`Server is running on port ${port}`);
});
