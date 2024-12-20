"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Complex query with multiple joins and Redis caching
router.get("/posts/:id", async (req, res) => {
    const postId = req.params.id;
    const cacheKey = `post:${postId}:details`;
    try {
        // Check cache first
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            logger_1.logger.info("Cache hit for post details");
            return res.json(JSON.parse(cachedData));
        }
        let result = await db_1.db
            .select({
            post: {
                id: schema_1.posts.id,
                title: schema_1.posts.title,
                content: schema_1.posts.content,
                createdAt: schema_1.posts.createdAt,
            },
            author: {
                id: schema_1.users.id,
                name: schema_1.users.name,
                email: schema_1.users.email,
            },
            comments: {
                id: schema_1.comments.id,
                content: schema_1.comments.content,
                authorId: schema_1.comments.authorId,
                createdAt: schema_1.comments.createdAt,
            },
        })
            .from(schema_1.posts)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.authorId, schema_1.users.id))
            .leftJoin(schema_1.comments, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.comments.postId))
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, postId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.comments.createdAt));
        const transformedResult = {
            ...result[0].post,
            author: result[0].author,
            comments: result[0].comments,
        };
        console.log(transformedResult);
        // Cache the result for 5 minutes
        await redis_1.default.setex(cacheKey, 300, JSON.stringify(transformedResult));
        logger_1.logger.info("Cache miss fo post details - data fetched from database");
        res.json(transformedResult);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching post details: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get all posts with Redis caching
router.get("/posts", async (_req, res) => {
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
            const result = await db_1.db
                .select({
                id: schema_1.posts.id,
                title: schema_1.posts.title,
                content: schema_1.posts.content,
                createdAt: schema_1.posts.createdAt,
                author: {
                    id: schema_1.users.id,
                    name: schema_1.users.name,
                    email: schema_1.users.email,
                },
            })
                .from(schema_1.posts)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.authorId, schema_1.users.id))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt));
            // Cache the result for 5 minutes
            // await redis.setex(cacheKey, 300, JSON.stringify(result));
            // logger.info("Cache miss for all posts - data fetched from database");
            res.json(result);
        }
        catch (error) {
            logger_1.logger.error(`Error fetching all posts: ${error}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    catch (error) {
        logger_1.logger.error(`Error fetching all posts: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Validation schema for creating a post
const createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(255, "Title is too long"),
    content: zod_1.z.string().min(1, "Content is required"),
    authorId: zod_1.z.string(),
});
// Create a new post
router.post("/posts", async (req, res) => {
    try {
        // Validate request body
        const validatedData = createPostSchema.parse(req.body);
        console.log("input", validatedData);
        const [newPost] = await db_1.db
            .insert(schema_1.posts)
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: "Validation error",
                details: error.errors,
            });
        }
        logger_1.logger.error(`Error creating post: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
