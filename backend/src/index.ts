import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { httpLogger, logger } from "./utils/logger";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

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
    console.log(err);

    // logger.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
