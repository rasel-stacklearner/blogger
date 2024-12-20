"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Validation schema for creating a user
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format")
        .max(255, "Email is too long"),
});
// Create a new user
router.post("/users", async (req, res) => {
    try {
        // Validate request body
        const validatedData = createUserSchema.parse(req.body);
        // Check if email already exists
        const existingUser = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, validatedData.email))
            .limit(1);
        if (existingUser.length > 0) {
            return res.status(400).json({
                error: "Validation error",
                details: [{ message: "Email already exists" }],
            });
        }
        // Insert the user
        const [newUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            name: validatedData.name,
            email: validatedData.email,
            createdAt: new Date(),
        })
            .returning();
        // Return the new user
        res.status(201).json(newUser);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: "Validation error",
                details: error.errors,
            });
        }
        logger_1.logger.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get all users
router.get("/users", async (_req, res) => {
    try {
        const result = await db_1.db
            .select({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            createdAt: schema_1.users.createdAt,
        })
            .from(schema_1.users)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt));
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error("Error fetching users: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
