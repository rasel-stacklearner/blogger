import { Router, Request, Response } from "express";
import { db } from "../db";
import { posts, users, comments } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import redis from "../config/redis";
import { logger } from "../utils/logger";
import { z } from "zod";

const router: Router = Router();

// Complex query with multiple joins and Redis caching
router.get("/posts/:id", async (req: Request, res: Response): Promise<any> => {
  const postId = req.params.id;
  const cacheKey = `post:${postId}:details`;

  try {
    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info("Cache hit for post details");
      return res.json(JSON.parse(cachedData));
    }

    let result = await db
      .select({
        post: {
          id: posts.id,
          title: posts.title,
          content: posts.content,
          createdAt: posts.createdAt,
        },
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        comments: {
          id: comments.id,
          content: comments.content,
          authorId: comments.authorId,
          createdAt: comments.createdAt,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .where(eq(posts.id, postId))
      .orderBy(desc(comments.createdAt));

    const transformedResult = {
      ...result[0].post,
      author: result[0].author,
      comments: result[0].comments,
    };

    console.log(transformedResult);

    // Cache the result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(transformedResult));

    logger.info("Cache miss fo post details - data fetched from database");
    res.json(transformedResult);
  } catch (error) {
    logger.error(`Error fetching post details: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all posts with Redis caching
router.get("/posts", async (_req: Request, res: Response): Promise<any> => {
  // const cacheKey = "all:posts";

  try {
    // Check cache first
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   logger.info("Cache hit for all posts");
    //   return res.json(JSON.parse(cachedData));
    // }

    try {
      // If not in cache, fetch from database
      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          createdAt: posts.createdAt,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .orderBy(desc(posts.createdAt));

      // Cache the result for 5 minutes
      // await redis.setex(cacheKey, 300, JSON.stringify(result));

      // logger.info("Cache miss for all posts - data fetched from database");
      res.json(result);
    } catch (error) {
      logger.error(`Error fetching all posts: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    logger.error(`Error fetching all posts: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validation schema for creating a post
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  authorId: z.string(),
});

// Create a new post
router.post("/posts", async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validatedData = createPostSchema.parse(req.body);

    console.log("input", validatedData);

    const [newPost] = await db
      .insert(posts)
      .values({
        title: validatedData.title,
        content: validatedData.content,
        authorId: validatedData.authorId,
        createdAt: new Date(),
      })
      .returning();
    // // Clear the posts cache
    // await redis.del("all:posts");

    // // If successful, return the new post
    // res.status(201).json(newPost);

    res.json(newPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error(`Error creating post: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
