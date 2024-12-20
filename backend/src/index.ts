import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { requestLogger, logger } from "./utils/logger";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";

config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(requestLogger);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://blogger-mauve.vercel.app"],
  })
);

// Routes
app.use("/api", postsRouter);
app.use("/api", usersRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err?.message);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
